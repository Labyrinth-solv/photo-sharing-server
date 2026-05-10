const express = require("express");
const User = require("../db/userModel");

const router = express.Router();

// Middleware kiểm tra đăng nhập
function requireAuth(req, res, next) {
  if (!req.session.userID) {
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

module.exports = router;
