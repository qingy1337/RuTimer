// routes/profile.js
const express = require("express");
const User = require("../models/User");
const Track = require("../models/Track");
const router = express.Router();

// Authentication middleware
function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/auth/login");
}

// Get all users
router.get("/users", isAuthenticated, async (req, res) => {
  try {
    const users = await User.getAllUsers();
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Get user profile
router.get("/users/:id", isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const tracks = await Track.findByUserId(user.id);

    // For each track, get the latest 5 times
    const tracksWithTimes = await Promise.all(
      tracks.map(async (track) => {
        const times = await Track.getTimesByTrackId(track.id);
        return {
          ...track,
          times: times.slice(0, 5), // Get only the latest 5 times for preview
        };
      }),
    );

    res.json({
      user,
      tracks: tracksWithTimes,
      currentUserId: req.user.id, // Add this to identify if viewing own profile
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
