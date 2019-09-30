const mongoose = require('mongoose');

module.exports = new mongoose.Schema(
  {
    _id: {
      type: String,
      required: true
    },
    created: {
      type: Date,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    password: {
      type: String,
      required: true
    }
  },
  {
    collection: 'users'
  }
);