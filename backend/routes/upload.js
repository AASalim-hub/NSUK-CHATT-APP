const express = require("express");
const router = express.Router();
const multer = require("multer");

// Storage setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({ storage });

// Upload route
router.post("/", upload.single("file"), (req, res) => {
  res.json({
    filePath: req.file.path
  });
});

module.exports = router;
