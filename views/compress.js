const fs = require('fs');
const minify = require('html-minifier').minify;

if (fs.existsSync(`${__dirname}/backup`)) {
  fs.readdir(`${__dirname}`, function (err, files) {
    if (err) return;
    files.forEach(function (file) {
      if (file.split('.').pop() !== 'ejs') return;
      if (fs.existsSync(`${__dirname}/backup/${file}`) && fs.readFileSync(`${__dirname}/${file}`) === fs.readFileSync(`${__dirname}/backup/${file}`)) {
        return;
      } else if (fs.existsSync(`${__dirname}/backup/${file}`)) {
        fs.unlinkSync(`${__dirname}/backup/${file}`);
      };
      fs.copyFile(`${__dirname}/${file}`, `${__dirname}/backup/${file}`, function (err) {
        if (err) return;
        fs.writeFileSync(`${__dirname}/${file}`, minify(fs.readFileSync(`${__dirname}/${file}`, encoding='utf8'),
          {
            collapseWhitespace: false,
            collapseBooleanAttributes: true,
            html5: true,
            minifyCSS: true,
            minifyJS: true,
            minifyURLs: true,
            removeComments: true
          }
        ));
      });
    });
  });
}