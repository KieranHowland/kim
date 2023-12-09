import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import fileUpload from 'express-fileupload';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import compression from 'compression';

dotenv.config();

const app = express();

mongoose.connect(`mongodb://${process.env.MONGOURL}:27017/${process.env.MONGODB}`);

mongoose.Promise = global.Promise;

mongoose.connection.on('error', console.error.bind(console, 'Connection Error:'));
mongoose.connection.once('open', () => {
  console.log(`Connected to MongoDB ${process.env.MONGO_HOST}:${process.env.MONGO_PORT}/${process.env.MONGO_DB}`);
});

app.set('view engine', 'ejs');

app.use(fileUpload({
  limits: {
    fileSize: 15 * 1024 * 1024
  }
}));
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(helmet());
app.use(compression());

app.use('/static', express.static('./static'));
app.use('/', express.static('./static/root'));

import indexRoutes from '../routes/index';
import apiRoutes from '../routes/api';
import loginRoutes from '../routes/login';
import dashboardRoutes from '../routes/dashboard';

app.use('/', indexRoutes);
app.use('/api', apiRoutes);
app.use('/login', loginRoutes);
app.use('/dashboard', dashboardRoutes);

app.use((req, res, next) => {
  res.status(404).render('info', {
    info: {
      title: 'Page Not Found',
      description: `Check the URL and try again.`
    }
  });
});

app.use((err, req, res, next) => {
  if (!err) next();

  return res.status(500).send('Fatal Error');
});

app.listen(process.env.SERVER_PORT, () => {
  console.log(`Server listening on ${process.env.SERVER_HOST}:${process.env.SERVER_PORT}`);
});