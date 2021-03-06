const path = require('path');

module.exports = {
  port: 8001,
  ip: '0.0.0.0',
  dir: {
    uploads: path.resolve('./uploads'),
    errors: path.resolve('./errors')
  },
  accepted: [
    'image/jpg',
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/bmp'
  ]
}