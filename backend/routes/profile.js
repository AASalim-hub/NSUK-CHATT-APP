const express = require("express");
const router = express.Router();
const multer = require("multer");
const User = require("../models/User");

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({ storage });

router.post("/", upload.single("image"), async (req, res) => {
  try {
    const { username } = req.body;

    const user = await User.findOne({ username });

    if (!user) return res.send("User not found");

    user.profilePic = req.file.path;
    await user.save();

    res.json({
      message: "Profile updated",
      profilePic: req.file.path
    });

  } catch (err) {
    console.log(err);
    res.send("Upload failed");
  }
});

module.exports = router;
