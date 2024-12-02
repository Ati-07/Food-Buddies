const mongoose = require('mongoose');

/**
 * Schema definition for the Food model.
 */
const foodSchema = new mongoose.Schema({
  description: {
    type: String,
    required: [true, 'Description is required.'], // Validation message for missing description
  }, // Name of the product
  type: {
    type: String,
    required: [true, 'Type is required.'], // Validation message for missing type
  }, // Type of Product
  dateMade: {
    type: Date,
    required: [true, 'Date Made is required.'], // Validation message for missing dateMade
    validate: {
      validator: function (value) {
        return value <= new Date(); // Ensures Date Made is not in the future
      },
      message: 'Date Made cannot be in the future.',
    },
  }, // Date Made
  expirationDate: {
    type: Date,
    required: [true, 'Expiration Date is required.'], // Validation message for missing expirationDate
    validate: {
      validator: function (value) {
        return this.dateMade ? value > this.dateMade : true; // Ensures Expiration Date is after Date Made
      },
      message: 'Expiration Date must be after Date Made.',
    },
  }, // Expiration date
  ingredients: {
    type: [String],
    default: [],
    validate: {
      validator: function (value) {
        return value.length > 0; // Ensures there is at least one ingredient
      },
      message: 'Ingredients cannot be empty.',
    },
  }, // Ingredients used
  images: {
    type: [String],
    default: ['/images/default.jpg'], // Default image if no images provided
  }, // Images associated with the food item
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to the User model
    required: true,
  }, // User who posted the food
  createdAt: {
    type: Date,
    default: Date.now, // Automatically sets the creation date
  }, // Creation date of the food item
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true, // Ensures geolocation type is specified
    },
    coordinates: {
      type: [Number], // Format: [longitude, latitude]
      required: true, // Ensures coordinates are provided
    },
  }, // Location coordinates for geospatial queries
});

/**
 * Index for geospatial queries
 */
foodSchema.index({ location: '2dsphere' }); // Enables geospatial queries

/**
 * Middleware to automatically populate the `postedBy` field with user details
 * when querying the Food model.
 */
foodSchema.pre(/^find/, function () {
  this.populate('postedBy', 'firstName lastName'); // Populates only firstName and lastName
});

// Export the model
module.exports = mongoose.model('Food', foodSchema);
