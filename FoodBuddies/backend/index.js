const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path'); // Required for serving static files
const authRoutes = require('./routes/auth'); // Import auth routes
const foodRoutes = require('./routes/food'); // Import food routes
const Food = require('./models/Food'); // Import the Food model
require('dotenv').config(); // Load environment variables from .env file

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json()); // Parse incoming JSON requests
app.use('/images', express.static(path.join(__dirname, 'images'))); // Serve static files from the images folder

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Predefined food list with corresponding images
const predefinedFoodMapping = {
  "Ham and Cheese": "/images/ham_cheese_sandwich.jpg",
  "Chicken Salad": "/images/chicken_salad.jpg",
  "Vegetable Soup": "/images/vegetable_soup.avif",
  "Pad Thai": "/images/pad_thai.webp",
  "Butter Chicken": "/images/butter_chicken.jpg",
  "Lasagna": "/images/lasagna.avif",
  "Beef Tacos": "/images/beef_taco.jpg",
  "Fried Rice": "/images/fried_rice.avif",
  "Guacamole": "/images/guacamole.jpg",
  "Mac and Cheese": "/images/mac_and_cheese.avif",
  default: "/images/default.jpg", // Fallback image
};

// Middleware to assign images based on predefined food list for /api/food/add
app.use('/api/food/add', (req, res, next) => {
  if (req.body.description) {
    const foodName = req.body.description;
    req.body.images = predefinedFoodMapping[foodName]
      ? [predefinedFoodMapping[foodName]]
      : [predefinedFoodMapping.default]; // Fallback to default image if food name doesn't match

    // Debug logs
    console.log('Description:', req.body.description);
    console.log('Assigned Image:', req.body.images[0]);
  } else {
    console.log('No description provided in the request.');
  }
  next();
});

// Route to clear all food listings
app.delete('/api/food/clear', async (req, res) => {
  try {
    await Food.deleteMany({});
    res.json({ message: 'All food listings cleared' });
  } catch (error) {
    console.error('Error clearing food listings:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Routes
app.use('/api/auth', authRoutes); // Use auth routes
app.use('/api/food', foodRoutes); // Use food routes

// Default Route
app.get('/', (req, res) => {
  res.send('Backend is running and connected to MongoDB!');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
