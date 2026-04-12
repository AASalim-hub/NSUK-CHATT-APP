const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema({
  name: String,
  admins: [String] // usernames
});

module.exports = mongoose.model("Room", roomSchema);
