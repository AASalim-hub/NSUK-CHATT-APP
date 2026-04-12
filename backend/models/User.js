const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },

  username: { type: String, unique: true, required: true },

  phone: { type: String, unique: true, required: true },

  email: { type: String, unique: true, required: true },

  matric: { type: String, unique: true, required: true },

  password: { type: String, required: true },

  faculty: String,
  department: String,
  level: String,

  // ✅ ADD THIS
  profilePic: {
    type: String,
    default: ""
  }
});

module.exports = mongoose.model("User", userSchema);
