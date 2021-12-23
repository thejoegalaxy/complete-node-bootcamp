const Review = require('../models/reviewModel');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

// Route Handlers
exports.getAllReviews = catchAsync(async (req, res, next) => {
  let filter = {};

  // if there is a tourId, then the filter object will be used
  // to get all reviews for that tourId.  If no tourId then we'll get all the reviews
  // because filter will be empty.
  if (req.params.tourId) filter = { tour: req.params.tourId };

  //console.log(req.params.tourId);

  const reviews = await Review.find(filter);
  //const tours = await query;

  //SEND RESPONSE
  res.status(200).json({
    status: 'success',
    //requestedAt: req.requestTime, //setting header property for requesteAt time.
    results: reviews.length, //size of array.
    // send all tours as the data.
    data: {
      reviews,
    },
  });
});

exports.setTourUserIds = (req, res, next) => {
  //Allow netsted routes.
  // specifying them when they are not in the body.
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id; //req.user, we get from the protect middleware.

  next();
};

exports.createReview = factory.createOne(Review);
exports.deleteReview = factory.deleteOne(Review);
exports.updateReview = factory.updateOne(Review);
