//const fs = require('fs');
const Tour = require('../models/tourModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./handlerFactory');

//read once into variable tours.
// const tours = JSON.parse(
//     fs.readFileSync(`${__dirname}/../starter/dev-data/data/tours-simple.json`)
// );

//middleware functions have access to next & val
// exports.checkID = (req, res, next, val) => {
//     console.log(`Tour id is: ${val}`);
//     if (val > tours.length) {
//         return res.status(404).json({
//             status: 'failed',
//             message: 'Invalid ID'
//         })
//     }
//     //remember to include next();
//     next();
// }

// exports.checkBody = (req, res, next) => {
//     if(!req.body.name || !req.body.price) {
//         return res.status(400).json({
//             status: 'failed',
//             message: 'missing name or price'
//         })
//     }
//     console.log('Hello from checkBody, passed...')
//     next();
// };

//middleware for aliasTopTours
exports.aliasTopTours = (req, res, next) => {
  console.log('aliasTopTours...');
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

// Route Handlers
exports.getAllTours = factory.getAll(Tour);

exports.updateTour = factory.updateOne(Tour);
exports.deleteTour = factory.deleteOne(Tour);
exports.createTour = factory.createOne(Tour);
exports.getTour = factory.getOne(Tour, { path: 'reviews' });

exports.getTourStats = catchAsync(async (req, res, next) => {
  //calling aggregate on the Model.
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        //_id: '$ratingsAverage',
        numTours: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      $sort: { avgPrice: 1 },
    },
    // {
    //     $match: { _id: { $ne: 'EASY' }}
    // }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      stats,
    },
  });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1;

  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTourStarts: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    {
      $addFields: { month: '$_id' },
    },
    {
      $project: {
        _id: 0,
      },
    },
    {
      $sort: { numTourStarts: -1 },
    },
    {
      $limit: 12,
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      plan,
    },
  });
});

// /tours-within/233/center/33.941585, -118.012144/unit/mi parameters way, looks cleaner.
//   '/tours-within/:distance/center/:latlng/:unit',
exports.getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params; //destructuring to get all variables
  const latlngsplit = latlng.split(',');

  const lat = latlngsplit[0];
  const lng = latlngsplit[1];
  //console.log(lat, lng);

  //need to convert to radians.  using the circumference of the earth in the right units.
  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

  if (!lat || !lng) {
    next(
      (new AppError(
        'Please provide latitude and longitude in the format lat,lng.'
      ),
      400)
    );
  }
  console.log(distance, lat, lng, unit);

  //find tours with a startLocation within a radius of centerSphere[lng,lat]
  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });

  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      data: tours,
    },
  });
});
