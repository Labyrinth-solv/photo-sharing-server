const express = require("express");
const Photo = require("../db/photoModel");
const User = require("../db/userModel");

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

// GET /photosOfUser/:id
router.get("/photosOfUser/:id", requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: "Invalid user id",
      });
    }

    const photos = await Photo.find({ user_id: req.params.id })
      .select("_id user_id file_name date_time comments")
      .populate({
        path: "comments.user_id",
        select: "_id first_name last_name",
      });

    const result = photos.map((p) => ({
      _id: p._id,
      user_id: p.user_id,
      file_name: p.file_name,
      date_time: p.date_time,
      comments: p.comments.map((c) => ({
        _id: c._id,
        comment: c.comment,
        date_time: c.date_time,
        user: c.user_id,
      })),
    }));

    return res.json(result);
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      message: err.message,
    });
  }
});

module.exports = router;
