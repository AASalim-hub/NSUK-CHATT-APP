const express = require("express");
const router = express.Router();
const User = require("../models/User");

router.post("/", async (req, res) => {
  try {
    const { username, name, phone, faculty, department, level, password } = req.body;

    let updateData = {
      name,
      phone,
      faculty,
      department,
      level
    };

    // ✅ ONLY update password IF user typed one
    if (password && password.trim() !== "") {
      updateData.password = password;
    }

    await User.updateOne({ username }, updateData);

    res.send("Profile updated successfully");

  } catch (err) {
    console.log(err);
    res.send("Update failed");
  }
});

module.exports = router;