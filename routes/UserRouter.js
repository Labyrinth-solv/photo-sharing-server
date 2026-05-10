const express = require("express");
const User = require("../db/userModel");
const session = require("express-session");
const router = express.Router();

// Middleware kiểm tra đăng nhập
function requireAuth(req, res, next) {
  if (!req.session.user) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }

  next();
}

// GET /api/user/list
router.get("/list", requireAuth, async (req, res) => {
  try {
    const users = await User.find({}, "_id first_name last_name");

    return res.json(users);
  } catch (err) {
    return res.status(500).json({
      message: err.message,
    });
  }
});

// GET /api/user/:id
router.get("/:id", requireAuth, async (req, res) => {
  try {
    const user = await User.findById(
      req.params.id,
      "_id first_name last_name location description occupation"
    );

    if (!user) {
      return res.status(404).json({
        message: "Invalid user id",
      });
    }

    return res.json(user);
  } catch (err) {
    return res.status(400).json({
      message: "Invalid user id",
    });
  }
});

router.post("/register", async (req, res) => {
  try {
    const {
      login_name,
      password,
      first_name,
      last_name,
      location,
      description="",
      occupation,
    } = req.body;

    // validation
    if (!login_name || !password) {
      return res.status(400).json({ message: "Missing login or password" });
    }

    if (!first_name || !last_name) {
      return res.status(400).json({ message: "Missing name fields" });
    }

    const existing = await User.findOne({ login_name });
    if (existing) {
      return res.status(400).json({ message: "Login name already exists" });
    }

    const newUser = new User({
      login_name,
      password,
      first_name,
      last_name,
      location,
      description,
      occupation,
    });

    await newUser.save();

    res.json({
      _id: newUser._id,
      login_name: newUser.login_name,
      first_name: newUser.first_name,
      last_name: newUser.last_name,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
