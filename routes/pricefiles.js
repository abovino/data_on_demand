const express = require('express');
const nodeMailer = require('nodemailer');
const fs = require('fs');
const papa = require('papaparse');
const ejs = require('ejs');
const createPrices = require('../utils/createPrices');
const router = express.Router();
const uuid = require('uuid/v1');
const path = require('path');

// @Route /pricefiles
// @Desc  Renders the pricefile form
router.get('/', (req, res) => res.render('price_file_form'));

// @Route /success
// @Desc  If email is succesfully sent to user then /pricefiles redirects to /success
router.get('/success', (req, res) => {
  if (!req.session.customerId || !req.session.userEmail) {
    res.render('error', {
      errMsg: 'It looks like you got here by accident.'
    });
  } else {
    res.render('success', {
      customerId: req.session.customerId,
      userEmail: req.session.userEmail,
      uid: req.session.uid,
    });
  }
});

// @Route /download/file/:uid
// @Desc  Unique download link for newly created price file
router.get('/download/file/:uid', (req, res, next) => {
  if (!req.session.customerId || !req.session.userEmail) {
    res.render('error', {
      errMsg: 'There\'s nothing here.  Your session may have timed out, or the download link expired.'
    });
  } else if (req.params.uid !== req.session.uid) {
    res.render('error', {
      errMsg: 'It looks like the session timed out.  Please try again.'
    });
  } else {
    const clientFileName = `${req.session.clientFileName}`;
    const uid = req.params.uid;
    res.download(path.join(__dirname, `../price_files/${uid}.csv`), `${clientFileName}.csv`, (err) => {
      if (err) {
        res.render('error', {
          errMsg: 'The server encountered an error and your file could not be found.  The download link may have expired.'
        });
      } else {
				req.session.destroy(); // Kill the session so the user can't get back to the download link
        fs.unlink(path.join(__dirname, `../price_files/${uid}.csv`), (err) => {
          console.log(err);
        });
      }
    })
  }
})

// @Route /pricefiles
// @Desc  Sends form data to the server
router.post('/pricefiles', (req, res) => {

  const {
    userEmail,
    customerId,
    customerFirstName,
    customerLastName,
    customerEmail,
    customerTitle
  } = req.body;
  let errors = [];

  if (!userEmail) {
    errors.push({ msg: 'A user email address is required' });
  } else if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(userEmail)) {
    errors.push({ msg: `${userEmail} is not a valid email address` });
  }

  if (!customerId) {
    errors.push({ msg: 'Customer Id is required' });
  } else if (!/^[0-9]*$/.test(customerId)) { // Regex to check if customerId string contains only numbers
    errors.push({ msg: 'Customer Id can only contain numbers' });
  } else if (customerId.length !== 8) {
    errors.push({ msg: 'Customer Id must be 8 digits' });
  }

  if (!customerFirstName) {
    errors.push({ msg: 'Customer first name is required' });
  }

  if (!customerLastName) {
    errors.push({ msg: 'Customer last name is required' });
  }

  if (!customerEmail) {
    errors.push({ msg: 'Customer email is required' });
  } else if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(customerEmail)) { // check customer email format
    errors.push({ msg: `${customerEmail} is not a valid email address` });
  }

  if (!customerTitle) {
    errors.push({ msg: 'Customer title is required' });
  }

  if (errors.length > 0) {
    res.render('price_file_form', {
      errors,
      userEmail,
      customerId,
      customerFirstName,
      customerLastName,
      customerEmail,
      customerTitle
    });
  } else {
    const date = new Date();
    const pricesJSON = createPrices();
    const pricesCSV = papa.unparse(pricesJSON, { header: true });
    const clientFileName = `${customerId}_${date.getFullYear()}_${date.getMonth() + 1}_${date.getDate()}`
    const uid = uuid();
    // ../public/price_files
    fs.writeFile(`./price_files/${uid}.csv`, pricesCSV, (err) => {
      if (err) throw err;
    });

    if (process.env.ENVIRONMENT === 'PRODUCTION') {
      req.session.customerId = customerId;
      req.session.userEmail = userEmail;
      req.session.clientFileName = clientFileName;
      req.session.uid = uid;
      res.redirect('/success');
    } else {
      const transporter = nodeMailer.createTransport({
        service: 'outlook',
        auth: {
          user: process.env.EMAIL,
          pass: process.env.EMAIL_PASSWORD
        }
      });

      // Render the email.ejs template as html and send to userEmail
      ejs.renderFile(__dirname + '/../views/email.ejs', {
        customerId: customerId,
        customerFirstName: customerFirstName,
        customerLastName: customerLastName,
        customerTitle: customerTitle,
        customerEmail: customerEmail,
      }, (err, email) => {
        if (err) {
          console.log(err);
        } else {
          const mailOptions = {
            from: process.env.EMAIL,
            to: userEmail,
            subject: `Price File for Customer ${customerId}`,
            html: email,
            attachments: [{
              filename: `${fileName}.csv`,
              path: `./price_files/${fileName}.csv`
            }],
          };

          transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
              console.log(error);
            } else {
              req.session.customerId = customerId;
              req.session.userEmail = userEmail;
              res.redirect('/success');
            }
          });
        }
      });
    }
  }
});

module.exports = router;
