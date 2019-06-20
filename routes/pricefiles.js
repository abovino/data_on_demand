const express = require('express');
const nodeMailer = require('nodeMailer');
const papa = require('papaparse');
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
    errors.push({ msg: `${userEmail} is not a valid email address`})
  }

  if (!customerId) {
    errors.push({ msg: 'Customer Id is required'});
  } else if (!/^[0-9]*$/.test(customerId)) { // Regex to check if customerId string contains only numbers
    errors.push({ msg: 'Customer Id can only contain numbers'})
  } else if (customerId.length !== 8) {
    errors.push({ msg: 'Customer Id must be 8 digits'})
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
    errors.push({ msg: `${customerEmail} is not a valid email address`})
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

    const transporter = nodeMailer.createTransport({
      host: '',
      port: 3000,
      secure: false,
      auth: null
    });

    const mailOptions = {
      from: 'abovino@lappusa.com',
      to: 'angelo.bovino@outlook.com',
      subject: `Price File for Customer ${customerId}`,
      text: `Here is your price file for customer # ${customerId}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
      } else {
        res.send(`Email sent ${info.response}`);
      }
    })
  }

});

module.exports = router;
