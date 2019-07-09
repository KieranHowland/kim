const express = require('express');
const randomstring = require('randomstring');
const fs = require('fs');
const jsonfile = require('jsonfile');

const settings = require('./settings');
const app = express();

app.set('view engine', 'ejs');

app.use(require('express-fileupload')({
  safeFileNames: true,
  preserveExtension: 10,
  limits: { fileSize: 20 * 1024 * 1024 }
}));
app.use(require('helmet')());
app.use(require('compression')());
app.use('/static', express.static('./static'));

app.use('/api', require('./routes/api'));
app.use('/', require('./routes/index'));

app.listen(settings.port, '0.0.0.0');