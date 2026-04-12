const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema({
  room: String,
  sender: String,
  text: String,
  isAdmin: Boolean,
  isFile: Boolean,
  profilePic: String,
  time: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Message", MessageSchema);
