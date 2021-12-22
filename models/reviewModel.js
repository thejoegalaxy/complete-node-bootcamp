const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');

// review / rating / createdAt / ref to tour / ref to user.
//Fat model, thin controller
//Review Schema
const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      trim: true,
      required: [true, 'Review cannot be empty.'],
    },
    rating: {
      type: Number,
      //default: 4.5,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false, //limit and exclude this from sending to client.
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour', //this parent ref. effectively creates the relationship.
      required: [true, 'Review must belong to a tour.'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User', //this parent referencing effectively creates the relationship.
      required: [true, 'Review must belong to a user.'],
    },
  },
  {
    //this will specifiy that the virtual data be included in output.
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

//Review model creation.
const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
