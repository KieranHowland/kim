require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const uniq = require('uniqid');

const app = express();
const settings = require('./settings');
const schemas = require('./schemas');

const Error = mongoose.model('error', schemas.Error);

mongoose.connect(`mongodb://${process.env.MONGOURL}:27017/${process.env.MONGODB}`, {
  auth: {
    authSource: 'admin'
  },
  user: process.env.MONGOUSER,
  pass: process.env.MONGOPASS,
  useNewUrlParser: true,
  useUnifiedTopology: true
});

mongoose.Promise = global.Promise;

mongoose.connection.on('error', console.error.bind(console, 'Connection Error:'));
mongoose.connection.once('open', () => {
  console.log('Connected to database!');
});

app.set('view engine', 'ejs');

app.use(require('express-fileupload')({
  limits: {
    fileSize: 15 * 1024 * 1024
  }
}));
app.use(require('body-parser').urlencoded({
  extended: false
}));
app.use(require('body-parser').json());
app.use(require('cookie-parser')());
app.use(require('helmet')());
app.use(require('compression')());

app.use('/static', express.static('./static'));
app.use('/', express.static('./static/root'));

app.use('/', require('./routes/index'));
app.use('/api', require('./routes/api'));
app.use('/login', require('./routes/login'));
app.use('/dashboard', require('./routes/dashboard'));

app.use((req, res, next) => {
  res.status(404).render('info', {
    info: {
      title: 'Page Not Found',
      description: `The server couldn't find anything at <b>${req.path}</b>`
    }
  });
});

app.use((error, req, res, next) => {
  if (!error) next();

  error.id = uniq();

  Error.create({
    _id: error.id,
    data: error.stack
  }, (err) => {
    if (err) console.error(err.stack);
    console.log(error);
    return res.status(500).send(`A fatal server error occured. Please send this code: '${error.id}' to '@KieranHowland' on Twitter or in an email to 'kieran.howland@mail.com'.`);
  });
});

app.listen(settings.port, '0.0.0.0');