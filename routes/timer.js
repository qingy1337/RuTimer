// routes/timer.js
const express = require("express");
const Track = require("../models/Track");
const router = express.Router();

// Import the database connection - Add this line
const db = require("../config/database");
// Authentication middleware
function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/auth/login");
}

// Get user tracks
router.get("/tracks", isAuthenticated, async (req, res) => {
  try {
    const tracks = await Track.findByUserId(req.user.id);
    res.json(tracks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Create new track
router.post("/tracks", isAuthenticated, async (req, res) => {
  try {
    const { name, theme } = req.body;
    const track = await Track.create(req.user.id, name, theme);
    res.json(track);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Update track
router.put("/tracks/:id", isAuthenticated, async (req, res) => {
  try {
    const { name, theme } = req.body;
    const result = await Track.update(req.params.id, name, theme, req.user.id);
    if (result.changes > 0) {
      res.json({ success: true });
    } else {
      res.status(404).json({ error: "Track not found or not authorized" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Delete track
router.delete("/tracks/:id", isAuthenticated, async (req, res) => {
  try {
    const result = await Track.delete(req.params.id, req.user.id);
    if (result.changes > 0) {
      res.json({ success: true });
    } else {
      res.status(404).json({ error: "Track not found or not authorized" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Add time to track
router.post("/tracks/:id/times", isAuthenticated, async (req, res) => {
  try {
    const { time_ms, scramble } = req.body;
    const result = await Track.addTime(req.params.id, time_ms, scramble);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Delete time
router.delete("/times/:id", isAuthenticated, async (req, res) => {
  try {
    // First, verify that the time belongs to a track owned by the current user
    const timeId = req.params.id;

    // Get the time and its associated track
    db.get(
      `SELECT times.id, times.track_id, tracks.user_id
       FROM times
       JOIN tracks ON times.track_id = tracks.id
       WHERE times.id = ?`,
      [timeId],
      (err, row) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: "Server error" });
        }

        if (!row) {
          return res.status(404).json({ error: "Time not found" });
        }

        // Check if the track belongs to the current user
        if (row.user_id !== req.user.id) {
          return res.status(403).json({ error: "Not authorized" });
        }

        // Delete the time
        db.run("DELETE FROM times WHERE id = ?", [timeId], function (err) {
          if (err) {
            console.error(err);
            return res.status(500).json({ error: "Server error" });
          }

          res.json({ success: true, changes: this.changes });
        });
      },
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Get times for track
router.get("/tracks/:id/times", isAuthenticated, async (req, res) => {
  try {
    const times = await Track.getTimesByTrackId(req.params.id);
    res.json(times);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Delete track
router.delete("/tracks/:id", isAuthenticated, async (req, res) => {
  try {
    // Check if this is the user's only track
    const tracks = await Track.findByUserId(req.user.id);
    if (tracks.length <= 1) {
      return res
        .status(400)
        .json({
          error: "Cannot delete the only track. Create another track first.",
        });
    }

    const result = await Track.delete(req.params.id, req.user.id);
    if (result.changes > 0) {
      res.json({ success: true });
    } else {
      res.status(404).json({ error: "Track not found or not authorized" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
