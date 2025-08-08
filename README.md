# RuTimer - Rubik's Cube Timer

A web application for timing Rubik's Cube solves, tracking progress, and analyzing performance.

## Features

- Precision timer for Rubik's Cube solves
- Scramble generator for random cube states
- Solve history and statistics
- Performance graphs and analytics
- User authentication and profiles

## Technologies Used

- Node.js with Express
- MongoDB for data storage
- EJS for templating
- Tailwind CSS for styling
- JavaScript for client-side functionality

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up your MongoDB database and add connection details to `config/database.js`
4. Start the server: `npm start`
5. Visit `http://localhost:3000` in your browser

## Project Structure

- `app.js` - Main application file
- `config/` - Database configuration
- `models/` - MongoDB data models
- `routes/` - Express route handlers
- `views/` - EJS templates
- `public/` - Static assets (CSS, JavaScript, images)

## Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Create a new Pull Request