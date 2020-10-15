const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    required: true,
    trim: true,
    match: [/^\w+[\w-\.]*\@\w+((-\w+)|(\w*))\.[a-z]{2,3}$/, "invalid email"],
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  done: {
    type: [Number],
  },
  createdAt: {
    required: true,
    type: Date,
    default: Date.now,
  },
});

module.exports = new mongoose.model('User', userSchema);