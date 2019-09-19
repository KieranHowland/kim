const express = require('express');
const uniq = require('uniqid');
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
  req.files.image.id = uniq();
  req.files.image.type = fileType(req.files.image.data);

  if (!req.files) return res.status(400).json({
    status: 400,
    code: 'invalidUpload'
  });
  if (typeof req.files.image === 'array') return res.status(400).json({
    status: 400,
    code: 'uploadLimitExceeded'
  });
  if (!req.files.image.type || !settings.accepted.includes(req.files.image.type.mime)) return res.status(400).json({
    status: 400,
    code: 'invalidType'
  });
  if (req.files.image.truncated) return res.status(400).json({
    status: 400,
    code: 'sizeLimitExceeded'
  });

  sharp(req.files.image.data)
    .toFile(`${settings.dir.uploads}/${req.files.image.id}.${req.files.image.type.ext}`)
    .then(() => {
      jsonFile.writeFileSync(`${settings.dir.uploads}/meta/${req.files.image.id}.json`, {
        uploadedAt: Math.floor(new Date() / 1000),
        filetype: req.files.image.name.split('.').pop().toLowerCase() === 'gif' ? 'gif' : 'png'
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
  if (fs.existsSync(`${settings.dir.uploads}/meta/${req.params.id}.json`)) {
    res.status(200).json({
      status: 200,
      data: jsonfile.readFileSync(`${settings.dir.uploads}/meta/${req.params.id}.json`)
    });
  } else {
    res.status(404).json({
      status: 404,
      code: 'notFound'
    });
  }
});

router.use((req, res, next) => {
  return res.status(404).json({
    status: 404,
    code: 'notFound'
  });
});

module.exports = router;