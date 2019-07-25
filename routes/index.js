const express = require('express');
const random = require('randomstring');
const sharp = require('sharp');
const fs = require('fs');
const jsonFile = require('jsonfile');

const router = express.Router();
const settings = require('../settings');

router.get('/', (req, res) => {
  return res.status(200).render('index');
});

router.post('/upload', (req, res) => {
  if (!req.files) return res.status(400).render('info',
  {
    info: {
      title: 'Invalid Upload',
      description: 'Woops something went wrong, please try again.'
    }
  });
  if (req.files.image.length) return res.status(400).render('info',
  {
    info: {
      title: 'Too Many Images',
      description: 'You can only upload <b>1</b> image at a time, please try again.'
    }
  });
  if (settings.accepted.indexOf(req.files.image.name.split('.').pop().toLowerCase()) < 0) return res.status(400).render('info',
  {
    info: {
      title: 'Unaccepted File Type',
      description: 'You can only upload images with a <b>png, jpg, jpeg or gif</b> file extension, please try again.'
    }
  });     
  if (req.files.image.truncated) return res.status(400).render('info',
  {
    info: {
      title: 'Image Too Large',
      description: 'The uploaded image exceeds the <b>20mb</b> upload limit, please try again.'
    }
  });

  while (true) {
    req.files.image.id = random.generate(32);
    if (!fs.existsSync(`${settings.dir.uploads}/${req.files.image.id}.${req.files.image.name.split('.').pop().toLowerCase() === 'gif' ? 'gif' : 'png'}`)) {
      sharp(req.files.image.data)
        .toFile(`${settings.dir.uploads}/${req.files.image.id}.${req.files.image.name.split('.').pop().toLowerCase() === 'gif' ? 'gif' : 'png'}`)
        .then(() => {
          jsonFile.writeFileSync(`${settings.dir.uploads}/meta/${req.files.image.id}.json`,
          {
            uploadedAt: Math.floor(new Date() / 1000),
            filetype: req.files.image.name.split('.').pop().toLowerCase() === 'gif' ? 'gif' : 'png'
          });
          return res.redirect(`/uploads/${req.files.image.id}`);
        });
      break;
    } else {
      req.files.image.id = random.generate(32);
      continue;
    }
  }
});

router.get('/uploads/:id', (req, res) => {
  if (fs.existsSync(`${settings.dir.uploads}/${req.params.id}.png`)) {
    return res.status(200).sendFile(`${settings.dir.uploads}/${req.params.id}.png`);
  } else if (fs.existsSync(`${settings.dir.uploads}/${req.params.id}.gif`)) {
    return res.status(200).sendFile(`${settings.dir.uploads}/${req.params.id}.gif`);
  } else {
    res.status(404).render('info',
    {
      info: {
        title: 'Upload Not Found',
        description: 'The requested image does not exist.'
      }
    });
  }
});

router.get('/meta/:id', (req, res) => {
  if (fs.existsSync(`${settings.dir.uploads}/meta/${req.params.id}.json`)) {
    let meta = jsonFile.readFileSync(`${settings.dir.uploads}/meta/${req.params.id}.json`);
    res.status(200).render('meta',
    {
      meta: {
        id: req.params.id,
        uploadedAt: meta.uploadedAt,
        fileType: meta.fileType
      }
    });
  } else {
    res.status(404).render('info',
    {
      info: {
        title: 'Meta Data Not Found',
        description: 'The requested image does not have any meta data stored.'
      }
    });
  }
});

module.exports = router;