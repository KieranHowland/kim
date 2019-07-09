const express = require('express');
const randomstring = require('randomstring');
const fs = require('fs');
const chalk = require('chalk');
const jsonfile = require('jsonfile');
const sharp = require('sharp');
const mongo = require('mongodb');
const settings = require('./settings');
const app = express();

process.on('error', (err) => {
  return console.error(err.stack);
});

app.set('view engine', 'ejs');

app.use(require('express-fileupload')({
  safeFileNames: true,
  preserveExtension: 10,
  limits: { fileSize: 20 * 1024 * 1024 }
}));
app.use(require('helmet')());
app.use(require('compression')());
app.use(express.static('public'));

app.use('/api', require('./api'));



app.listen(settings.port, '0.0.0.0');
