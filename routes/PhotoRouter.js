const express = require("express");
const Photo = require("../db/photoModel");
const User = require("../db/userModel");
const session = require("express-session");
const router = express.Router();


const multer = require("multer");
const crypto = require("crypto");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images/");
  },

  filename: (req, file, cb) => {
    const uniqueName =
      crypto.randomBytes(16).toString("hex") +
      path.extname(file.originalname);

    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

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

router.post("/new", requireAuth, upload.single("photo"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const photo = new Photo({
      file_name: req.file.filename,
      date_time: new Date(),
      user_id: req.session.user._id,
      comments: [],
    });

    await photo.save();

    res.json(photo);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
