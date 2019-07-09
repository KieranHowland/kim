const express = require('express');
const Datauri = require('datauri');
const chalk = require('chalk');
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
        "status":200,
        "data":{
          "uploads": files.filter(file => file.split('.').pop() === 'png' || file.split('.').pop() === 'gif').length
        }
      }
    );
  });
});

router.get('/datauri/:imageID', (req, res) => {
  if (fs.existsSync(`${__dirname}/uploads/${req.params.imageID}.png`)) {
    return res.status(200).json(
      {
        "status":200,
        "data":{
          "uri":new Datauri(`${__dirname}/uploads/${req.params.imageID}.png`).content
        }
      }
    );
  } else if (fs.existsSync(`${__dirname}/uploads/${req.params.imageID}.gif`)) {
    return res.status(400).json(
      {
        "status":400,
        "code":"invalidFileExtension"
      }
    );
  } else {
    return res.status(404).json(
      {
        "status":404,
        "code":"imageNotFound"
      }
    );
  }
});

router.post('/upload', async (req, res) => {
  if (req.files) {
    if (!req.files.image.length) {
      if (settings.acceptedFiletypes.indexOf(req.files.image.name.split('.').pop().toLowerCase()) > -1) {
        if (!req.files.image.truncated) {
          while (true) {
            let imageID = randomstring.generate(32);
            if (!fs.existsSync(`${__dirname}/uploads/${imageID}.${req.files.image.name.split('.').pop().toLowerCase() === 'gif' ? 'gif' : 'png'}`)) {
              sharp(req.files.image.data)
                .toFile(`${__dirname}/uploads/${imageID}.${req.files.image.name.split('.').pop().toLowerCase() === 'gif' ? 'gif' : 'png'}`)
                .then(() => {
                  jsonfile.writeFileSync(`${__dirname}/uploads/meta/${imageID}.json`, { "uploadedAt": Math.floor(new Date() / 1000), "filetype": req.files.image.name.split('.').pop().toLowerCase() === 'gif' ? 'gif' : 'png' });
                  console.log(`${chalk.green('+ Image Uploaded')}\n  ID: ${chalk.cyan(imageID)}`);
                  return res.status(200).json(
                    {
                      "status": 200,
                      "data": {
                        "imageID": imageID,
                        "filetype": req.files.image.name.split('.').pop().toLowerCase() === 'gif' ? 'gif' : 'png'
                      }
                    }
                  );
                });
              break;
            } else {
              imageID = randomstring.generate(32);
              continue;
            }
          }
        } else {
          return res.status(400).json(
            {
              "status":400,
              "code":"imageTooLarge"
            }
          );
        }
      } else {
        return res.status(400).json(
          {
            "status":400,
            "code":"invalidFileExtension"
          }
        );
      }
    } else {
      return res.status(400).json(
        {
          "status":400,
          "code":"tooManyImages"
        }
      );
    }
  } else {
    return res.status(400).json(
      {
        "status":400,
        "code":"requestBodyInvalid"
      }
    );
  }
});

router.get('/meta/:imageID', (req, res) => {
  if (fs.existsSync(`${__dirname}/uploads/meta/${req.params.imageID}.json`)) {
    res.status(200).json(
      {
        status:200,
        data: jsonfile.readFileSync(`${__dirname}/uploads/meta/${req.params.imageID}.json`)
      }
    );
  } else {
    res.status(500).json(
      {
        "status":500,
        "code":"metaNotFound"
      }
    );
  }
});

router.use((req, res, next) => {
  return res.status(404).json(
    {
      "status":400,
      "code":"invalidPathMethod"
    }
  );
});

router.use((err, req, res, next) => {
  let errorID = randomstring.generate(16);
  while (true) {
    if (!fs.existsSync(`${__dirname}/errors/${errorID}.txt`)) {
      fs.writeFile(`${__dirname}/errors/${errorID}.txt`, `Error ID: ${errorID}\nError Time: ${new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')}\n\n---START OF ERROR---\n${err.stack}\n----END OF ERROR----`, (err) => {
        console.error(err);
      });
      res.status(500).json(
        {
          "status":500,
          "code":"internalServerError",
          "reference":errorID
        }
      );
      break;
    } else {
      errorID = randomstring.generate(16);
      continue;
    }
  }
});

module.exports = router;