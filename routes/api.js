const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const uniq = require('uniqid');

const router = express.Router();
const settings = require('../settings');
const schemas = require('../schemas');

const Image = mongoose.model('image', schemas.Image);

router.get('/', (req, res) => {
  return res.status(200).render('api');
});

router.post('/upload', async (req, res) => {
  req.files.image.id = uniq();
  req.files.image.type = fileType(req.files.image.data);

  if (!req.files || req.files === null) return res.status(400).json({
    status: 400,
    code: 'invalid_body'
  });
  if (typeof req.files.image === 'array') return res.status(400).json({
    status: 400,
    code: 'quantity_limit_exceeded'
  });
  if (!req.files.image.type || !settings.accepted.includes(req.files.image.type.mime)) return res.status(400).json({
    status: 400,
    code: 'invalid_type'
  });
  if (req.files.image.truncated) return res.status(400).json({
    status: 400,
    code: 'size_limit_exceeded'
  });

  Image.create({
    _id: req.files.image.id,
    data: req.files.image.data,
    meta: {
      uploaded: Date.now(),
      type: req.files.image.type
    },
    uploader: bcrypt.hashSync(req.ip, 10)
  }, (err) => {
    if (err) return res.status(500).json({
      status: 500,
      code: 'internal_server_error'
    });

    return res.status(200).json({
      status: 200,
      data: {
        id: req.files.image.id,
        type: req.files.image.type
      }
    });
  });
});

router.get('/meta/:id', (req, res) => {
  Image.findById(req.params.id, (err, image) => {
    if (err) return res.status(500).json({
      status: 500,
      code: 'internal_server_error'
    });

    if (!image) return res.status(404).json({
      status: 404,
      code: 'not_found'
    });

    return res.status(200).json({
      status: 200,
      data: image.meta
    });
  });
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

    if (!bcrypt.compareSync(req.ip, image.uploader)) return res.status(400).json({
      status: 400,
      code: 'invalid_uploader'
    });

    image.delete();

    return res.status(200).json({
      status: 200,
      data: 'success'
    });
  });
});

router.use((req, res, next) => {
  return res.status(404).json({
    status: 404,
    code: 'invalid_endpoint'
  });
});

module.exports = router;
