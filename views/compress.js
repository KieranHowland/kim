const fs = require('fs');
const path = require('path');
const minify = require('html-minifier').minify;

if (!fs.existsSync(__dirname + '/backup')) fs.mkdirSync(__dirname + '/backup');

for (let file of fs.readdirSync(__dirname)) {
  if (fs.statSync(path.resolve(__dirname, file)).isDirectory()) continue;
  if (file.split('.').pop() !== 'ejs') continue;

  if (fs.existsSync(path.resolve(__dirname, 'backup', file))) fs.unlinkSync(path.resolve(__dirname, 'backup', file));

  fs.copyFileSync(path.resolve(__dirname, file), path.resolve(__dirname, 'backup', file));
  
  fs.writeFileSync(path.resolve(__dirname, file), minify(fs.readFileSync(path.resolve(__dirname, file)), {
    html5: true,
    minifyCSS: true,
    minifyURLs: true,
    removeComments: true
  }));
};