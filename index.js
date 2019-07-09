const express = require('express');

const app = express();
const settings = require('./settings');

app.set('view engine', 'ejs');

app.use(require('express-fileupload')(
{
  limits: { 
    fileSize: 20 * 1024 * 1024 
  }
}));
app.use(require('helmet')());
app.use(require('compression')());
app.use('/static', express.static('./static'));

app.use('/api', require('./routes/api'));
app.use('/', require('./routes/index'));

app.use((err, req, res, next) => {
  err.id = randomstring.generate(16);
  while (true) {
    if (!fs.existsSync(`${__dirname}/errors/${err.id}.txt`)) {
      fs.writeFile(`${__dirname}/errors/${err.id}.txt`, `Error ID: ${err.id}\nError Time: ${new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')}\n\n---START OF ERROR---\n${err.stack}\n----END OF ERROR----`, (err) => {
        console.error(err.stack);
      });
      res.status(500).send(`An internal server error occured, please copy the code below and send it to <b>Kie#0001</b> (Discord) or <b>@KieIsWillSmith</b> (Twitter)...<br><br>${id}`);
      break;
    } else {
      err.id = randomstring.generate(16);
      continue;
    }
  }
});

app.listen(settings.port, '0.0.0.0');