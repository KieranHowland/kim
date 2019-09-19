require('dotenv').config();

const express = require('express');
const fs = require('fs');
const uniq = require('uniqid');

const app = express();
const settings = require('./settings');

app.set('view engine', 'ejs');

app.use(require('express-fileupload')({
  limits: {
    fileSize: 20 * 1024 * 1024
  }
}));
app.use(require('helmet')());
app.use(require('compression')());

app.use('/static', express.static('./static'));
app.use('/', express.static('./static/root'));

app.use('/', require('./routes/index'));
app.use('/api', require('./routes/api'));
app.use('/admin', require('./routes/admin'));

app.use((req, res, next) => {
  res.status(404).render('info', {
    info: {
      title: 'Page Not Found',
      description: `The server couldn't find anything at <b>${req.path}</b>`
    }
  });
});

app.use((err, req, res, next) => {
  if (!err) return;

  err.id = uniq();

  fs.writeFileSync(`${__dirname}/errors/${err.id}.txt`, `Error ID: ${err.id}\nError Time: ${new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')}\n\n---START OF ERROR---\n${err.stack}\n----END OF ERROR----`);

  res.status(500).send(`An internal server error occured, please copy the code below and send it to <b>@KieranHowland</b> on Twitter...<br><br>${err.id}`);
});

app.listen(settings.port, '0.0.0.0');