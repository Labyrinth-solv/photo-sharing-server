const express = require("express");
const Photo = require("../db/photoModel");
const User = require("../db/userModel");
const session = require("express-session");
const router = express.Router();

function requireAuth(req, res, next) {
  if (!req.session.user) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }

  next();
}

router.post("/commentsOfPhoto/:photo_id", requireAuth, async (req, res) => {
    try {
      const { comment } = req.body;
      const user = req.session.user;
  
      // 2. check empty comment
      if (!comment || comment.trim() === "") {
        return res.status(400).json({ message: "Empty comment" });
      }
  
      const photo = await Photo.findById(req.params.photo_id);
  
      if (!photo) {
        return res.status(404).json({ message: "Photo not found" });
      }
  
      // 3. push comment đúng schema của bạn
      photo.comments.push({
        comment: comment,
        user_id: user._id,
        date_time: new Date(),
      });
  
      await photo.save();
  
      return res.json(photo);
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  });

  module.exports=router;