const mongoose = require('mongoose');

module.exports = new mongoose.Schema(
  {
    _id: {
      type: String,
      required: true
    },
    data: {
      type: Object,
      required: true
    }
  },
  {
    collection: 'errors'
  }
);