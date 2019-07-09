const express = require('express');
const Datauri = require('datauri');
const jsonfile = require('jsonfile');
const sharp = require('sharp');
const router = express.Router();
const fs = require('fs');
const randomstring = require('randomstring');
const settings = require('./settings');

router.use((req, res, next) => {
  console.log(`> API Request Recieved\n  Path: ${chalk.cyan(req.path)}\n  Method: ${chalk.cyan(req.method)}`);
  next()
});

router.get('/', (req, res) => {
  return res.status(200).render('api_documentation');
});

router.get('/uploads', (req, res) => {
  fs.readdir(`${__dirname}/uploads/`, (err, files) => {
    return res.status(200).json(
      {
        status:200,
        data:{
          uploads: files.filter(file => file.split('.').pop() === 'png' || file.split('.').pop() === 'gif').length
        }
      }
    );
  });
});

router.get('/datauri/:id', (req, res) => {
  if (fs.existsSync(`${__dirname}/uploads/${req.params.id}.png`)) {
    return res.status(200).json(
    {
      status: 200,
      data:{
        uri: new Datauri(`${__dirname}/uploads/${req.params.id}.png`).content
      }
    });
  } else if (fs.existsSync(`${__dirname}/uploads/${req.params.id}.gif`)) {
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

router.post('/upload', async (req, res) => {
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
  if (settings.acceptedFiletypes.indexOf(req.files.image.name.split('.').pop().toLowerCase()) > -1) return res.status(400).render('info',
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
    req.files.image.id = randomstring.generate(32);
    if (!fs.existsSync(`${__dirname}/uploads/${req.files.image.id}.${req.files.image.name.split('.').pop().toLowerCase() === 'gif' ? 'gif' : 'png'}`)) {
      sharp(req.files.image.data)
        .toFile(`${__dirname}/uploads/${req.files.image.id}.${req.files.image.name.split('.').pop().toLowerCase() === 'gif' ? 'gif' : 'png'}`)
        .then(() => {
          jsonfile.writeFileSync(`${__dirname}/uploads/meta/${req.files.image.id}.json`, 
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
      req.files.image.id = randomstring.generate(32);
      continue;
    }
  }
});

router.get('/meta/:id', (req, res) => {
  if (fs.existsSync(`${__dirname}/uploads/meta/${req.params.id}.json`)) {
    res.status(200).json(
    {
      status: 200,
      data: jsonfile.readFileSync(`${__dirname}/uploads/meta/${req.params.id}.json`)
    });
  } else {
    res.status(404).json(
    {
      status: 404,
      code: 'notFound'
    });
  }
});

router.use((req, res, next) => {
  return res.status(404).json(
  {
    status: 404,
    code: 'notFound'
  });
});

router.use((err, req, res, next) => {
  let err.id = randomstring.generate(16);
  while (true) {
    if (!fs.existsSync(`${__dirname}/errors/${err.id}.txt`)) {
      fs.writeFile(`${__dirname}/errors/${err.id}.txt`, `Error ID: ${err.id}\nError Time: ${new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')}\n\n---START OF ERROR---\n${err.stack}\n----END OF ERROR----`, (err) => {
        console.error(err);
      });
      res.status(500).json(
      {
        status:500,
        code: internalServerError,
        reference: err.id
      });
      break;
    } else {
      err.id = randomstring.generate(16);
      continue;
    }
  }
});

module.exports = router;