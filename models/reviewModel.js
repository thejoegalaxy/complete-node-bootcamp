const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');
const Tour = require('./tourModel');

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

reviewSchema.pre(/^find/, function (next) {
  //   this.populate({
  //     path: 'tour',
  //     select: 'name', //
  //   }).populate({
  //     path: 'user',
  //     select: 'name', //
  //   });
  //we turned off tour populate because it was creating a chain of populates.
  this.populate({
    path: 'user',
    select: 'name photo',
  });

  next();
});

reviewSchema.statics.calcAverageRatings = async function (tourId) {
  //this points to the model.
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);
  console.log(stats);
  //update Tour document with these stats.
  await Tour.findByIdAndUpdate(tourId, {
    ratingsQuantity: stats[0].nRating,
    ratingsAverage: stats[0].avgRating,
  });
};

//this will be called after saving a new review.
//which will calculate the Average Rating and number of ratings
//as programmed above.
reviewSchema.post('save', function () {
  //this points to the current review.
  // constructor is the Model.
  // Allowing us to call this before the below model creation.
  this.constructor.calcAverageRatings(this.tour);
  //post does not have access to next.
});
//Review model creation.
const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
