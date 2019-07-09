const express = require('express');
const router = express.Router();

router.use((req, res, next) => {
  console.log(`${chalk.green('> Request Recieved')}\n  Path: ${chalk.cyan(req.path)}\n  Method: ${chalk.cyan(req.method)}`);
  next();
});

router.get('/', (req, res) => {
  return res.status(200).render('index');
});

router.post('/upload', (req, res) => {
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
                  return res.redirect(`/uploads/${imageID}`);
                });
              break;
            } else {
              imageID = randomstring.generate(32);
              continue;
            }
          }
        } else {
          res.status(400).render('info', { info: { title: 'Image Too Large', description: 'The uploaded image exceeds the <b>20mb</b> upload limit, please try again.' } });
        }
      } else {
        res.status(400).render('info', { info: { title: 'Unaccepted File Type', description: 'You can only upload images with a <b>png, jpg, jpeg or gif</b> file extension, please try again.' } });
      }
    } else {
      res.status(400).render('info', { info: { title: 'Too Many Images', description: 'You can only upload <b>1</b> image at a time, please try again.' } });
    }
  } else {
    res.status(400).render('info', { info: { title: 'Invalid Upload', description: 'Woops something went wrong, please try again.' } });
  }
});

router.get('/uploads/:imageID', (req, res) => {
  if (fs.existsSync(`${__dirname}/uploads/${req.params.imageID}.png`)) {
    return res.status(200).sendFile(`${__dirname}/uploads/${req.params.imageID}.png`);
  } else if (fs.existsSync(`${__dirname}/uploads/${req.params.imageID}.gif`)) {
    return res.status(200).sendFile(`${__dirname}/uploads/${req.params.imageID}.gif`);
  } else {
    res.status(400).render('info', { info: { title: 'Upload Not Found', description: 'The requested image does not exist.' } });
  }
});

router.get('/meta/:imageID', (req, res) => {
  if (fs.existsSync(`${__dirname}/uploads/meta/${req.params.imageID}.json`)) {
    let meta = jsonfile.readFileSync(`${__dirname}/uploads/meta/${req.params.imageID}.json`);
    res.status(200).render('meta', { meta: { id: req.params.imageID, uploadedAt: meta.uploadedAt, fileType: meta.fileType } });
  } else {
    res.status(500).json(
      {
        "status": 500,
        "code": "metaNotFound"
      }
    );
  }
});

router.use((req, res, next) => {
  res.status(404).render('info', { info: { title: 'Page Not Found', description: `The server couldn't find anything at <b>${req.path}</b>` } });
});

router.use((err, req, res, next) => {
  let errorID = randomstring.generate(16);
  while (true) {
    if (!fs.existsSync(`${__dirname}/errors/${errorID}.txt`)) {
      fs.writeFile(`${__dirname}/errors/${errorID}.txt`, `Error ID: ${errorID}\nError Time: ${new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')}\n\n---START OF ERROR---\n${err.stack}\n----END OF ERROR----`, (err) => {
        console.error(err);
      });
      res.status(500).send(`An internal server error occured, please copy the code below and send it to <b>Kie#0001</b> (Discord) or <b>@KieIsWillSmith</b> (Twitter)...<br><br>${errorID}`);
      break;
    } else {
      errorID = randomstring.generate(16);
      continue;
    }
  }
});

module.exports = router;