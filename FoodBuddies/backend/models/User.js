const mongoose = require('mongoose');

/**
 * Schema definition for the User model.
 */
const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true, // First name is mandatory
    },
    lastName: {
      type: String,
      required: true, // Last name is mandatory
    },
    email: {
      type: String,
      required: true, // Email is mandatory
      unique: true, // Each email must be unique
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, // Basic email format validation
    },
    password: {
      type: String,
      required: true, // Password is mandatory
    },
    address: {
      street: {
        type: String,
        required: true, // Street address is mandatory
      },
      aptNumber: {
        type: String, // Apartment number is optional
      },
      city: {
        type: String,
        required: true, // City is mandatory
      },
      state: {
        type: String,
        required: true, // State is mandatory
      },
      zipcode: {
        type: String,
        required: true, // Zipcode is mandatory
        match: /^\d{5}$/, // Ensures 5-digit US zipcode format
      },
    },
    phone: {
      type: String,
      required: true, // Phone number is mandatory
      match: /^\d{10}$/, // Ensures 10-digit phone number format
    },
    birthdate: {
      type: Date,
      validate: {
        validator: function (value) {
          return value <= new Date(); // Ensures birthdate is not in the future
        },
        message: 'Birthdate cannot be in the future.',
      },
    },
    role: {
      type: String,
      enum: ['donor', 'recipient'], // Restricts values to 'donor' or 'recipient'
      default: 'recipient', // Default role is 'recipient'
    },
  },
  {
    timestamps: true, // Automatically adds `createdAt` and `updatedAt` fields
  }
);

module.exports = mongoose.model('User', userSchema);
