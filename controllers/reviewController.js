const Review = require('../models/reviewModel');
const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// Route Handlers
exports.getAllReviews = catchAsync(async (req, res, next) => {
  //EXECUTE QUERY
  //   const features = new APIFeatures(Review.find(), req.query)
  //     .filter()
  //     .sort()
  //     .limitFields()
  //     .paginate();
  // const reviews = await features.query;

  const reviews = await Review.find();
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

exports.createReview = catchAsync(async (req, res, next) => {
  //Allow netsted routes.
  // specifying them when they are not in the body.
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id; //req.user, we get from the protect middleware.

  //console.log(req.body);
  const newReview = await Review.create(req.body);
  //console.log(newReview);

  //send response 201 and new tour object back to client.
  res.status(201).json({
    status: 'success',
    data: {
      review: newReview,
    },
  });
});
