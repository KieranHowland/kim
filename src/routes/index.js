const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const fileType = require('file-type');

const router = express.Router();
const settings = require('../settings');
const schemas = require('../src/schemas');

const Image = mongoose.model('image', schemas.Image);

router.get('/', (req, res) => {
  return res.status(200).render('index');
});

router.post('/upload', (req, res) => {
  req.files.image.type = fileType(req.files.image.data);

  if (!req.files || req.files === null) return res.status(400).render('info', {
    info: {
      title: 'Invalid Request',
      description: 'The request body did not contain an image'
    }
  });
  if (typeof req.files.image === 'array') return res.status(400).render('info', {
    info: {
      title: 'Too Many Images',
      description: 'You can only upload <b>1</b> image at a time, please try again.'
    }
  });
  if (!req.files.image.type || !settings.accepted.includes(req.files.image.type.mime)) return res.status(400).render('info', {
    info: {
      title: 'Unaccepted File Type',
      description: 'You can only upload images with a <b>png, jpeg, gif or bmp</b> file type, please try again.'
    }
  });
  if (req.files.image.truncated) return res.status(400).render('info', {
    info: {
      title: 'Image Too Large',
      description: 'The uploaded image exceeds the <b>15mb</b> upload limit, please try again.'
    }
  });
  if (req.body.key && req.body.key.length > 32) return res.status(400).render('info', {
    info: {
      title: 'Key Too Long',
      description: 'The specified key exceeded the maximum length of <b>32</b> characters, please try again.'
    }
  });

  Image.create({
    _id: req.files.image.id,
    data: req.files.image.data,
    meta: {
      uploaded: Date.now(),
      type: req.files.image.type
    },
    uploader: bcrypt.hashSync(req.ip, 10),
    key: req.body.key ? bcrypt.hashSync(req.body.key, 10) : ''
  }, (err) => {
    if (err) return res.status(500).render('info', {
      info: {
        title: 'Internal Server Error',
        description: 'An unknown error occured while processing the uploaded image, please try again later.'
      }
    });

    return res.redirect(`/uploads/${req.files.image.id}`);
  });
});

router.get('/uploads/:id/:key?', (req, res) => {
  Image.findById(req.params.id, (err, image) => {
    if (err) return res.status(500).render('info', {
      info: {
        title: 'Internal Server Error',
        description: 'An unknown error occured while processing your request, please try again later.'
      }
    });

    if (!image) return res.status(404).render('info', {
      info: {
        title: 'Upload Not Found',
        description: 'The requested image does not exist.'
      }
    });

    if (image.key) {
      if (!req.params.key) return res.redirect('/authenticate/' + req.params.id);

      if (!bcrypt.compareSync(req.params.key, image.key)) return res.status(400).render('info', {
        info: {
          title: 'Invalid Key',
          description: 'The given key does not match the stored key.'
        }
      });
    };

    res.type(image.meta.type.mime);

    return res.status(200).send(image.data);
  });
});

router.get('/authenticate/:id', (req, res) => {
  if (!req.params.id) return res.redirect('/');

  return res.status(200).render('authenticate');
});

router.get('/delete/:id', (req, res) => {
  Image.findById(req.params.id, (err, image) => {
    if (err) return res.status(500).render('info', {
      info: {
        title: 'Internal Server Error',
        description: 'An unknown error occured while processing your request, please try again later.'
      }
    });

    if (!image) return res.status(404).render('info', {
      info: {
        title: 'Upload Not Found',
        description: 'The requested image does not exist.'
      }
    });

    if (!bcrypt.compareSync(req.ip, image.uploader)) return res.status(400).render('info', {
      info: {
        title: 'Invalid Uploader',
        description: 'Your IP address does not match the one associated with this image.'
      }
    });

    image.delete();

    return res.status(400).render('info', {
      info: {
        title: 'Deleted Image',
        description: 'The image and meta data associated with it has been deleted.'
      }
    });
  });
});

module.exports = router;
