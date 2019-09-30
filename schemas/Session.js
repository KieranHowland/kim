const mongoose = require('mongoose');

module.exports = new mongoose.Schema(
  {
    _id: {
      type: String,
      required: true
    },
    user: {
      type: String,
      required: true
    },
    ip: {
      type: String,
      required: true
    },
    created: {
      type: Date,
      required: true
    },
    expire: {
      type: Date,
      required: true
    }
  },
  {
    collection: 'sessions'
  }
);