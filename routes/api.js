const express = require('express');
const random = require('randomstring');
const sharp = require('sharp');
const fs = require('fs');
const jsonfile = require('jsonfile');
const dataUri = require('datauri');

const router = express.Router();
const settings = require('../settings');

router.get('/', (req, res) => {
  return res.status(200).render('api_documentation');
});

router.post('/upload', async (req, res) => {
  if (!req.files) return res.status(400).json(
  {
    status: 400,
    code: 'invalidUpload'
  });
  if (req.files.image.length) return res.status(400).json(
  {
    status: 400,
    code: 'uploadLimitExceeded'
  });
  if (settings.acceptedFiletypes.indexOf(req.files.image.name.split('.').pop().toLowerCase()) < 0) return res.status(400).json(
  {
    status: 400,
    code: 'invalidType'
  });
  if (req.files.image.truncated) return res.status(400).json(
  {
    status: 400,
    code: 'sizeLimitExceeded'
  });

  while (true) {
    req.files.image.id = random.generate(32);
    if (!fs.existsSync(`${__dirname}/uploads/${req.files.image.id}.${req.files.image.name.split('.').pop().toLowerCase() === 'gif' ? 'gif' : 'png'}`)) {
      sharp(req.files.image.data)
        .toFile(`${__dirname}/uploads/${req.files.image.id}.${req.files.image.name.split('.').pop().toLowerCase() === 'gif' ? 'gif' : 'png'}`)
        .then(() => {
          jsonfile.writeFileSync(`${settings.dir.uploads}/meta/${req.files.image.id}.json`, 
          { 
            uploadedAt: Math.floor(new Date() / 1000), 
            filetype: req.files.image.name.split('.').pop().toLowerCase() === 'gif' ? 'gif' : 'png' 
          });
          return res.status(200).json(
          {
            status: 200,
            data: {
              id: req.files.image.id,
              filetype: req.files.image.name.split('.').pop().toLowerCase() === 'gif' ? 'gif' : 'png'
            }
          });
        });
      break;
    } else {
      req.files.image.id = random.generate(32);
      continue;
    }
  }
});

router.get('/meta/:id', (req, res) => {
  if (fs.existsSync(`${settings.dir.uploads}/meta/${req.params.id}.json`)) {
    res.status(200).json(
    {
      status: 200,
      data: jsonfile.readFileSync(`${settings.dir.uploads}/meta/${req.params.id}.json`)
    });
  } else {
    res.status(404).json(
    {
      status: 404,
      code: 'notFound'
    });
  }
});

router.get('/uri/:id', (req, res) => {
  if (fs.existsSync(`${settings.dir.uploads}/${req.params.id}.png`)) {
    return res.status(200).json(
    {
      status: 200,
      data: {
        uri: new dataUri(`${settings.dir.uploads}/${req.params.id}.png`).content
      }
    });
  } else if (fs.existsSync(`${settings.dir.uploads}/${req.params.id}.gif`)) {
    return res.status(400).json(
    {
      status: 400,
      code: 'invalidFileExtension'
    });
  } else {
    return res.status(404).json(
    {
      status: 404,
      code: 'notFound'
    });
  }
});

router.get('/version', (req, res) => {
  return res.status(200).json(
  {
    status: 200,
    data: {
      version: process.env.VERSION
    }
  });
});

router.use((req, res, next) => {
  return res.status(404).json(
  {
    status: 404,
    code: 'notFound'
  });
});

module.exports = router;