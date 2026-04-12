const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");


// ======================
// SIGNUP
// ======================
router.post("/signup", async (req, res) => {
  try {
    const {
      name,
      username,
      phone,
      email,
      matric,
      password,
      faculty,
      department,
      level
    } = req.body;

    // ✅ VALIDATIONS
    if (!email.endsWith("@nsuk.edu.ng")) {
      return res.json({ message: "Use a valid NSUK email" });
    }

    if (!/^[a-zA-Z0-9]{1,11}$/.test(matric)) {
      return res.json({ message: "Matric must be <= 11 and alphanumeric" });
    }

    // ✅ HASH PASSWORD
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ CREATE USER
    await User.create({
      name,
      username,
      phone,
      email,
      matric,
      password: hashedPassword,
      faculty,
      department,
      level
    });

    res.json({ message: "Signup successful" });

  } catch (err) {
    console.log("SIGNUP ERROR:", err);

    if (err.code === 11000) {
      return res.json({
        message: "Duplicate: username, email, phone or matric already exists"
      });
    }

    res.json({ message: "Signup failed" });
  }
});


// ======================
// LOGIN
// ======================
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });

    if (!user) {
      return res.json({ message: "User not found" });
    }

    // ✅ COMPARE HASHED PASSWORD
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.json({ message: "Wrong password" });
    }

    res.json({
      message: "Login successful",
      user: user
    });

  } catch (err) {
    console.log("LOGIN ERROR:", err);
    res.json({ message: "Login error" });
  }
});

module.exports = router;
