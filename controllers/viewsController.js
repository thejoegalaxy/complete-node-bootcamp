const Tour = require('../models/tourModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./handlerFactory');

exports.getOverview = catchAsync(async (req, res, next) => {
  // 1) Get tour data from collection
  const tours = await Tour.find();

  // 2) Build Template
  // done in overview.pug

  // Render that template using tour data from 1).
  res.status(200).render('overview', {
    title: 'All Tours',
    tours, //pass tours into render overview.
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  // 1. get the data, for the requested tour (including reviews & guides)
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user',
  });
  //console.log(tour);

  // 2. build template

  // 3. Render template using the data from 1.
  res.status(200).render('tour', {
    title: `${tour.name} Tour`,
    tour,
  });
});
