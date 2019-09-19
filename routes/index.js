const express = require('express');
const uniq = require('uniqid');
const sharp = require('sharp');
const fs = require('fs');
const jsonFile = require('jsonfile');
const fileType = require('file-type');

const router = express.Router();
const settings = require('../settings');

router.get('/', (req, res) => {
  return res.status(200).render('index');
});

router.post('/upload', (req, res) => {
  req.files.image.id = uniq();
  req.files.image.type = fileType(req.files.image.data);

  if (!req.files) return res.status(400).render('info', {
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
      description: 'The uploaded image exceeds the <b>20mb</b> upload limit, please try again.'
    }
  });

  sharp(req.files.image.data)
    .toFile(`${settings.dir.uploads}/${req.files.image.id}.${req.files.image.type.ext}`)
    .then(() => {
      jsonFile.writeFileSync(`${settings.dir.uploads}/meta/${req.files.image.id}.json`, {
        uploadedAt: Math.floor(new Date() / 1000),
        filetype: req.files.image.name.split('.').pop().toLowerCase() === 'gif' ? 'gif' : 'png'
      });
      return res.redirect(`/uploads/${req.files.image.id}`);
    });
});

router.get('/uploads/:id', (req, res) => {
  if (fs.existsSync(`${settings.dir.uploads}/${req.params.id}.png`)) {
    return res.status(200).sendFile(`${settings.dir.uploads}/${req.params.id}.png`);
  } else if (fs.existsSync(`${settings.dir.uploads}/${req.params.id}.gif`)) {
    return res.status(200).sendFile(`${settings.dir.uploads}/${req.params.id}.gif`);
  } else {
    res.status(404).render('info', {
      info: {
        title: 'Upload Not Found',
        description: 'The requested image does not exist.'
      }
    });
  }
});

module.exports = router;