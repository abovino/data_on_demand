const express = require('express');
const nodeMailer = require('nodeMailer');
const router = express.Router();

// @Route /pricefiles
// @Desc  Renders the pricefile form
// @Auth  Public
router.get('/', (req, res) => res.render('price_file_form'));

// @Route /pricefiles
// @Desc  Sends form data to the server
// @Auth  Public
router.post('/', (req, res) => {
  console.log(req.body);
  const { 
    userEmail, 
    sapId, 
    customerFirstName, 
    customerLastName, 
    customerEmail, 
    customerTitle
  } = req.body;
  let errors = [];

  if (!userEmail) {
    errors.push({ msg: 'A LAPP email address is required'});
  } else if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(userEmail)) {
    errors.push({ msg: `${userEmail} is not a valid email address`})
  } else if (userEmail.slice(-12) !== '@lappusa.com') {
    errors.push({ msg: 'Please enter a valid LAPP USA email address'});
  }

  if (!sapId) {
    errors.push({ msg: 'SAP customer Id is required'});
  } else if (!/^[0-9]*$/.test(sapId)) { // Regex to check if sapId string contains only numbers
    errors.push({ msg: 'SAP customer Id can only contain numbers'})
  } else if (sapId.length !== 8) {
    errors.push({ msg: 'SAP customer Id must be 8 characters'})
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
      sapId, 
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
      subject: `Price File for Customer ${sapId}`,
      text: `Here is your price file for customer # ${sapId}`,
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
