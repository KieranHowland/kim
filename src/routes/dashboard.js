const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const router = express.Router();
const schemas = require('../src/schemas');

const Image = mongoose.model('image', schemas.Image);
const User = mongoose.model('user', schemas.User);
const Session = mongoose.model('session', schemas.Session);

router.use((req, res, next) => {
  if (!req.cookies || !req.cookies.session) return res.redirect('/login');

  Session.findOne({
    _id: req.cookies.session
  }, (err, session) => {
    if (err) return res.status(500).send('Internal server error.');

    if (!session || session.expire < Date.now() || !bcrypt.compareSync(req.ip, session.ip)) {
      session.delete();

      cookies.set('session', {
        maxAge: Date.now()
      });

      return res.status(400).render('login');
    };

    req.user = session.user;

    next();
  });
});

router.get('/', (req, res) => {
  return res.status(200).render('dashboard');
});

router.get('/delete/:id', (req, res) => {
  Image.findById(req.params.id, (err, image) => {
    if (err) return res.status(500).json({
      status: 500,
      code: 'internal_server_error'
    });

    if (!image) return res.status(404).json({
      status: 404,
      code: 'not_found'
    });

    image.delete();

    return res.redirect('/dashboard');
  });
});

router.get('/raw/:id', (req, res) => {
  Image.findById(req.params.id, (err, image) => {
    if (err) return res.status(500).json({
      status: 500,
      code: 'internal_server_error'
    });

    if (!image) return res.status(404).json({
      status: 404,
      code: 'not_found'
    });

    return res.status(200).send(image);
  });
});

module.exports = router;