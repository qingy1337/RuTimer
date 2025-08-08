// routes/auth.js (fixed version)
const express = require("express");
const passport = require("passport");
const bcrypt = require("bcrypt");
const router = express.Router();

// Import the database connection - Add this line
const db = require("../config/database");

// Login page
router.get("/login", (req, res) => {
  if (req.isAuthenticated()) {
    return res.redirect("/");
  }

  // Send plain HTML instead of using EJS
  const message = req.query.message || "";
  const loginHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Login - Rubik's Cube Timer</title>
      <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
    </head>
    <body class="bg-gray-100 min-h-screen flex items-center justify-center">
      <div class="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <div class="text-center mb-6">
          <h1 class="text-3xl font-bold text-blue-600">Rubik's Cube Timer</h1>
          <p class="text-gray-600">Sign in to your account</p>
        </div>

        ${
          message
            ? `
          <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            ${message}
          </div>
        `
            : ""
        }

        <form action="/auth/login" method="POST">
          <div class="mb-4">
            <label for="username" class="block text-gray-700 text-sm font-medium mb-1">Username</label>
            <input type="text" id="username" name="username" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required>
          </div>

          <div class="mb-6">
            <label for="password" class="block text-gray-700 text-sm font-medium mb-1">Password</label>
            <input type="password" id="password" name="password" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required>
          </div>

          <button type="submit" class="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500">
            Sign In
          </button>
        </form>

        <div class="mt-4 text-center">
          <p class="text-gray-600">Don't have an account? <a href="/auth/register" class="text-blue-500 hover:underline">Register</a></p>
        </div>
      </div>
    </body>
    </html>
  `;

  res.send(loginHtml);
});

// Login process (POST)
router.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.redirect("/auth/login?message=Invalid credentials");
    }
    req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }
      return res.redirect("/");
    });
  })(req, res, next);
});

// Register page
router.get("/register", (req, res) => {
  if (req.isAuthenticated()) {
    return res.redirect("/");
  }

  // Send plain HTML instead of using EJS
  const message = req.query.message || "";
  const registerHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Register - Rubik's Cube Timer</title>
      <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
    </head>
    <body class="bg-gray-100 min-h-screen flex items-center justify-center">
      <div class="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <div class="text-center mb-6">
          <h1 class="text-3xl font-bold text-blue-600">Rubik's Cube Timer</h1>
          <p class="text-gray-600">Create a new account</p>
        </div>

        ${
          message
            ? `
          <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            ${message}
          </div>
        `
            : ""
        }

        <form action="/auth/register" method="POST">
          <div class="mb-4">
            <label for="username" class="block text-gray-700 text-sm font-medium mb-1">Username</label>
            <input type="text" id="username" name="username" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required>
          </div>

          <div class="mb-4">
            <label for="password" class="block text-gray-700 text-sm font-medium mb-1">Password</label>
            <input type="password" id="password" name="password" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required>
          </div>

          <div class="mb-6">
            <label for="confirmPassword" class="block text-gray-700 text-sm font-medium mb-1">Confirm Password</label>
            <input type="password" id="confirmPassword" name="confirmPassword" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required>
          </div>

          <button type="submit" class="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500">
            Register
          </button>
        </form>

        <div class="mt-4 text-center">
          <p class="text-gray-600">Already have an account? <a href="/auth/login" class="text-blue-500 hover:underline">Sign In</a></p>
        </div>
      </div>
    </body>
    </html>
  `;

  res.send(registerHtml);
});

// Register process (POST)
router.post("/register", async (req, res) => {
  try {
    const { username, password, confirmPassword } = req.body;

    // Validate input
    if (!username || !password) {
      return res.redirect(
        "/auth/register?message=Username and password are required",
      );
    }

    if (password !== confirmPassword) {
      return res.redirect("/auth/register?message=Passwords do not match");
    }

    // Check if username already exists
    db.get(
      "SELECT * FROM users WHERE username = ?",
      [username],
      async (err, user) => {
        if (err) {
          console.error(err);
          return res.redirect("/auth/register?message=Registration failed");
        }

        if (user) {
          return res.redirect("/auth/register?message=Username already exists");
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert new user
        db.run(
          "INSERT INTO users (username, password) VALUES (?, ?)",
          [username, hashedPassword],
          function (err) {
            if (err) {
              console.error(err);
              return res.redirect("/auth/register?message=Registration failed");
            }

            const userId = this.lastID;

            // Create default track for new user
            db.run(
              "INSERT INTO tracks (user_id, name, theme) VALUES (?, ?, ?)",
              [userId, "Default 3x3", "blue"],
              function (err) {
                if (err) {
                  console.error(err);
                  // Continue even if track creation fails
                }

                // Log in the user
                const user = { id: userId, username };
                req.login(user, (err) => {
                  if (err) {
                    console.error(err);
                    return res.redirect(
                      "/auth/login?message=Registration successful. Please log in.",
                    );
                  }
                  return res.redirect("/");
                });
              },
            );
          },
        );
      },
    );
  } catch (err) {
    console.error(err);
    res.redirect("/auth/register?message=Registration failed");
  }
});

// The rest of the file remains the same...

// Logout
router.get("/logout", (req, res) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/auth/login");
  });
});

module.exports = router;
