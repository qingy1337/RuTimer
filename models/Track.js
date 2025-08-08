// models/Track.js
const db = require('../config/database');

class Track {
  static async create(userId, name, theme = 'blue') {
    return new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO tracks (user_id, name, theme) VALUES (?, ?, ?)',
        [userId, name, theme],
        function(err) {
          if (err) return reject(err);
          resolve({ id: this.lastID, user_id: userId, name, theme });
        }
      );
    });
  }

  static async findById(id) {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM tracks WHERE id = ?', [id], (err, row) => {
        if (err) return reject(err);
        resolve(row);
      });
    });
  }

  static async findByUserId(userId) {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM tracks WHERE user_id = ? ORDER BY created_at DESC', [userId], (err, rows) => {
        if (err) return reject(err);
        resolve(rows);
      });
    });
  }

  static async update(id, name, theme, userId) {
    return new Promise((resolve, reject) => {
      db.run(
        'UPDATE tracks SET name = ?, theme = ? WHERE id = ? AND user_id = ?',
        [name, theme, id, userId],
        function(err) {
          if (err) return reject(err);
          resolve({ changes: this.changes });
        }
      );
    });
  }

  static async delete(id, userId) {
    return new Promise((resolve, reject) => {
      db.run(
        'DELETE FROM tracks WHERE id = ? AND user_id = ?',
        [id, userId],
        function(err) {
          if (err) return reject(err);
          resolve({ changes: this.changes });
        }
      );
    });
  }

  static async addTime(trackId, timeMs, scramble) {
    return new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO times (track_id, time_ms, scramble) VALUES (?, ?, ?)',
        [trackId, timeMs, scramble],
        function(err) {
          if (err) return reject(err);
          resolve({ id: this.lastID, track_id: trackId, time_ms: timeMs, scramble });
        }
      );
    });
  }

  static async getTimesByTrackId(trackId) {
    return new Promise((resolve, reject) => {
      db.all(
        'SELECT * FROM times WHERE track_id = ? ORDER BY timestamp DESC',
        [trackId],
        (err, rows) => {
          if (err) return reject(err);
          resolve(rows);
        }
      );
    });
  }
}

module.exports = Track;
