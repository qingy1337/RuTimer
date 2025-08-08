// app.js
const express = require("express");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");
var favicon = require("serve-favicon");
const db = require("./config/database");
const User = require("./models/User");
const app = express();

// Set up middleware
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
// app.js (update middleware section)
// Set up middleware
app.use(express.urlencoded({ extended: true })); // Important for form submissions
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.use(favicon(path.join(__dirname, "public", "/favicon.ico")));
// Session setup
app.use(
  session({
    secret: "rubiks-timer-secret",
    resave: false,
    saveUninitialized: false,
    cookie: { 
      maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 years in milliseconds
      httpOnly: true
    }
  }),
);

// Passport setup
app.use(passport.initialize());
app.use(passport.session());

// Passport configuration
passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const user = await User.findByUsername(username);
      if (!user) return done(null, false, { message: "Incorrect username" });

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return done(null, false, { message: "Incorrect password" });

      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }),
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

// Import routes
const authRoutes = require("./routes/auth");
const timerRoutes = require("./routes/timer");
const profileRoutes = require("./routes/profile");

// Use routes
app.use("/auth", authRoutes);
app.use("/timer", timerRoutes);
app.use("/profile", profileRoutes);

// Home route
app.get("/", (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect("/auth/login");
  }
  res.render("index", { user: req.user });
});

// Start server
const PORT = process.env.PORT || 3210;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});

module.exports = app;
