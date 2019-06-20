const express = require('express');
const expressLayouts = require('express-ejs-layouts');

const PORT = process.env.PORT || 3000;
const app = express();

// app.use(express.json({ extended: true }));
app.use(express.urlencoded({ extended: true }));

// Setup template engine
app.use(expressLayouts);
app.set('view engine', 'ejs');

// Static files
app.use(express.static(__dirname + '/public'));

// Routes
app.use('/pricefiles', require('./routes/pricefiles'));

app.listen(PORT, (req, res) => console.log(`Server listening on PORT ${PORT}`));
