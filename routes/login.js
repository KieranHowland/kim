const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const uniq = require('uniqid');

const router = express.Router();
const schemas = require('../schemas');

const User = mongoose.model('user', schemas.User);
const Session = mongoose.model('session', schemas.Session);

router.get('/', (req, res) => {
  if (!req.cookies || !req.cookies.session) return res.status(200).render('login');

  return res.redirect('/dashboard');
});

router.post('/', (req, res) => {
  if (!req.body.name) return res.status(400).send('Missing name field.');
  if (!req.body.password) return res.status(400).send('Missing password field.');

  User.findOne({
    name: req.body.name
  }, (err, user) => {
    if (err) return res.status(500).send('Internal server error.');

    if (!user) return res.status(400).send('User does not exist.');

    if (!bcrypt.compareSync(req.body.password, user.password)) return res.status(400).send('Password does not match.');

    Session.find({
      user: user._id
    }, (err, sessions) => {
      for (let session of sessions) {
        session.delete();
      };
    });

    Session.create({
      _id: uniq(),
      user: user._id,
      ip: bcrypt.hashSync(req.ip, 10),
      created: Date.now(),
      expire: Date.now() + 1 * 24 * 60 * 60 * 1000
    }, (err, session) => {
      res.cookie('session', session._id);
      return res.redirect('/dashboard');
    });
  });
});

module.exports = router;