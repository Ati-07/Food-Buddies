const express = require('express');
const jwt = require('jsonwebtoken');
const moment = require('moment-timezone');
const NodeGeocoder = require('node-geocoder'); // Geocoding library
const Food = require('../models/Food'); // Import the Food model
const User = require('../models/User'); // Import the User model

const router = express.Router();

// Initialize geocoder with Google API
const geocoder = NodeGeocoder({
  provider: 'google',
  apiKey: process.env.GEOCODING_API_KEY, // Ensure this is stored in your .env file
});

/**
 * Middleware to authenticate the user.
 */
function authenticate(req, res, next) {
  const token = req.headers['x-auth-token'];

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.id;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
}

/**
 * Add a new food listing (Donor functionality).
 */
router.post('/add', authenticate, async (req, res) => {
  const { description, type, dateMade, expirationDate, ingredients, zipcode } = req.body;

  try {
    console.log("Request Body:", req.body); // Debug log for incoming request payload

    // Validate required fields
    if (!description || !type || !zipcode) {
      return res.status(400).json({ message: 'All required fields must be provided.' });
    }

    // Convert dates to EST before saving
    const dateMadeEST = moment.tz(dateMade, 'America/New_York').toDate();
    const expirationDateEST = moment.tz(expirationDate, 'America/New_York').toDate();

    if (expirationDateEST <= dateMadeEST) {
      return res.status(400).json({ message: 'Expiration date must be after the date made.' });
    }

    // Geocode the ZIP code
    const geocodeData = await geocoder.geocode(zipcode);
    console.log("Geocode Data:", geocodeData); // Debug log for geocoding

    if (!geocodeData.length) {
      return res.status(400).json({ message: 'Invalid ZIP code' });
    }
    const { latitude, longitude } = geocodeData[0];

    // Create the food document with geolocation
    const newFood = new Food({
      description,
      type,
      dateMade: dateMadeEST,
      expirationDate: expirationDateEST,
      ingredients,
      postedBy: req.user,
      images: req.body.images || ['/images/default.jpg'], // Default image
      location: {
        type: 'Point',
        coordinates: [longitude, latitude], // Longitude first, then latitude
      },
    });

    await newFood.save();
    res.status(201).json(newFood);
  } catch (error) {
    console.error('Error adding food:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * Get food listings near a user's location or all food listings.
 * Updated to show all listings when no ZIP code is specified and filter by ZIP code otherwise.
 */
router.get('/', async (req, res) => {
  const { lat, lng, zipcode } = req.query;

  try {
    // If latitude and longitude are provided, find listings (this will be used by the map)
    if (lat && lng) {
      const latitude = parseFloat(lat);
      const longitude = parseFloat(lng);

      if (isNaN(latitude) || isNaN(longitude)) {
        return res.status(400).json({ message: 'Invalid latitude or longitude' });
      }

      // Return all food listings without radius if no ZIP code provided
      const foodListings = await Food.find().populate('postedBy', 'firstName lastName');
      return res.json(foodListings);
    }

    // If no lat/lng is provided, return all food listings
    if (!zipcode) {
      const foodListings = await Food.find().populate('postedBy', 'firstName lastName');
      return res.json(foodListings);
    }

    // Geocode the user's ZIP code if only zipcode is provided
    const geocodeData = await geocoder.geocode(zipcode);
    console.log("Geocode Data:", geocodeData); // Debug log for geocoding

    if (!geocodeData.length) {
      return res.status(400).json({ message: 'Invalid ZIP code' });
    }
    const { latitude, longitude } = geocodeData[0];

    // Find food within a 10-mile radius based on ZIP code
    const foodListings = await Food.find({
      location: {
        $geoWithin: {
          $centerSphere: [[longitude, latitude], 10 / 3963.2], // Radius in radians (10 miles)
        },
      },
    }).populate('postedBy', 'firstName lastName');

    res.json(foodListings);
  } catch (error) {
    console.error('Error fetching food listings:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * Clear all food listings (Admin functionality).
 */
router.delete('/clear', authenticate, async (req, res) => {
  try {
    await Food.deleteMany({});
    res.json({ message: 'All food listings cleared successfully!' });
  } catch (error) {
    console.error('Error clearing food listings:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * Get specific user details for the modal (frontend usage).
 */
router.get('/user/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('firstName lastName contact');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching user details:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * Request food (Recipient functionality).
 */
router.post('/:foodId/request', authenticate, async (req, res) => {
  const { foodId } = req.params;

  try {
    const food = await Food.findById(foodId);
    if (!food) {
      return res.status(404).json({ message: 'Food not found' });
    }

    if (food.requests && food.requests.includes(req.user)) {
      return res.status(400).json({ message: 'You have already requested this food' });
    }

    food.requests.push(req.user);
    await food.save();

    res.json({ message: 'Request sent', food });
  } catch (error) {
    console.error('Error requesting food:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * Search and filter food listings by type.
 */
router.get('/search', async (req, res) => {
  const { type } = req.query;

  try {
    const filters = {};
    if (type) filters.description = new RegExp(type, 'i');

    const foodListings = await Food.find(filters).populate('postedBy', 'firstName lastName');
    res.json(foodListings);
  } catch (error) {
    console.error('Error searching food listings:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * Delete a specific food listing (Admin/Donor functionality).
 */
router.delete('/:foodId', authenticate, async (req, res) => {
  const { foodId } = req.params;

  try {
    const food = await Food.findById(foodId);
    if (!food) {
      return res.status(404).json({ message: 'Food not found' });
    }

    if (food.postedBy.toString() !== req.user) {
      return res.status(403).json({ message: 'Not authorized to delete this food' });
    }

    await Food.findByIdAndDelete(foodId);
    res.json({ message: 'Food listing deleted' });
  } catch (error) {
    console.error('Error deleting food listing:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * Update a specific food listing (Donor functionality).
 */
router.put('/:foodId', authenticate, async (req, res) => {
  const { foodId } = req.params;

  try {
    const food = await Food.findById(foodId);
    if (!food) {
      return res.status(404).json({ message: 'Food not found' });
    }

    if (food.postedBy.toString() !== req.user) {
      return res.status(403).json({ message: 'Not authorized to update this food' });
    }

    Object.assign(food, req.body);
    await food.save();

    res.json({ message: 'Food listing updated', food });
  } catch (error) {
    console.error('Error updating food listing:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
