const mongoose = require('mongoose');

module.exports = new mongoose.Schema(
  {
    _id: {
      type: String,
      required: true
    },
    data: {
      type: Buffer,
      required: true
    },
    meta: {
      uploaded: {
        type: Date,
        required: true
      },
      type: {
        mime: {
          type: String
        },
        ext: {
          type: String
        }
      }
    },
    uploader: {
      type: String,
      required: true
    },
    key: {
      type: String,
      required: false
    }
  },
  {
    collection: 'images'
  }
);