const express = require('express');
const nodeMailer = require('nodeMailer');
const fs = require('fs');
const papa = require('papaparse');
const createPrices = require('../utils/createPrices');
const router = express.Router();

// @Route /pricefiles
// @Desc  Renders the pricefile form
// @Auth  Public
router.get('/', (req, res) => res.render('price_file_form'));

// @Route /pricefiles
// @Desc  Sends form data to the server
// @Auth  Public
router.post('/pricefiles', (req, res) => {
  console.log(req.body);
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
    errors.push({ msg: 'A user email address is required'});
  } else if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(userEmail)) {
    errors.push({ msg: `${userEmail} is not a valid email address`});
  }

  if (!customerId) {
    errors.push({ msg: 'Customer Id is required'});
  } else if (!/^[0-9]*$/.test(customerId)) { // Regex to check if customerId string contains only numbers
    errors.push({ msg: 'Customer Id can only contain numbers'});
  } else if (customerId.length !== 8) {
    errors.push({ msg: 'Customer Id must be 8 digits'});
  }
  
  if (!customerFirstName) {
    errors.push({ msg: 'Customer first name is required'});
  }

  if (!customerLastName) {
    errors.push({ msg: 'Customer last name is required'});
  }

  if (!customerEmail) {
    errors.push({ msg: 'Customer email is required'});
  } else if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(customerEmail)) { // check customer email format
    errors.push({ msg: `${customerEmail} is not a valid email address`});
  }

  if (!customerTitle) {
    errors.push({ msg: 'Customer title is required'});
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
    const fileName = `${customerId}_${date.getFullYear()}_${date.getMonth() + 1}_${date.getDate()}`

    fs.writeFile(`./price_files/${fileName}.csv`, pricesCSV, (err) => {
      if (err) throw err;
      console.log('File created');
    });

    const transporter = nodeMailer.createTransport({
      service: 'outlook',
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    const mailOptions = {
      from: process.env.EMAIL,
      to: userEmail,
      subject: `Price File for Customer ${customerId}`,
      text: `Here is your price file for customer # ${customerId}`,
      attachments: [{
        filename: `${fileName}.csv`,
        path: `./price_files/${fileName}.csv`
      }]
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
      } else {
        console.log(info);
        // res.send(`Email sent ${info}`);
        res.render('price_file_form', {
          success: {
            msg: `Success!  Price file sent to ${userEmail}`
          }
        });
      }
    });
  }

});

module.exports = router;
