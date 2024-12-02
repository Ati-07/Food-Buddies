const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Import the User model
const authenticate = require('../middleware/auth'); // Import authentication middleware
require('dotenv').config(); // Load environment variables

const router = express.Router();

/**
 * @route   POST /api/auth/signup
 * @desc    Register a new user
 * @access  Public
 */
router.post('/signup', async (req, res) => {
  const {
    firstName,
    lastName,
    email,
    password,
    address: { street, aptNumber, city, state, zipcode } = {},
    phone,
    birthdate,
  } = req.body;

  try {
    // Validate required fields
    if (!firstName || !lastName || !email || !password || !street || !city || !state || !zipcode || !phone) {
      return res.status(400).json({ message: 'All required fields must be filled' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user object
    const newUser = new User({
      firstName,
      lastName,
      email,
      password: await bcrypt.hash(password, 10), // Hash the password
      address: {
        street,
        aptNumber: aptNumber || null, // Optional field
        city,
        state,
        zipcode,
      },
      phone,
      birthdate,
    });

    // Save the user to the database
    await newUser.save();

    // Generate JWT Token
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    return res.status(201).json({ token, user: newUser });
  } catch (error) {
    console.error('Signup error:', error.message);
    return res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user and return token
 * @access  Public
 */
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Validate input fields
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Generate JWT Token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    return res.json({ token, user });
  } catch (error) {
    console.error('Login error:', error.message);
    return res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   GET /api/auth/me
 * @desc    Get logged-in user's information
 * @access  Private
 */
router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user).select('-password'); // Exclude password field
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.json({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      birthdate: user.birthdate,
      address: user.address,
      role: user.role,
    });
  } catch (error) {
    console.error('Fetch user error:', error.message);
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;