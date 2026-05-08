const express = require("express");
const User = require("../db/userModel");
const router = express.Router();

// GET /api/list
router.get("/list", async (req, res) => {
  try {
    const users = await User.find({}, "_id first_name last_name");
    res.json(users);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// GET /api/:id
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(
      req.params.id,
      "_id first_name last_name location description occupation"
    );

    if (!user) {
      return res.status(400).send("Invalid user id");
    }

    res.json(user);
  } catch (err) {
    res.status(400).send("Invalid user id");
  }
});

module.exports = router;
