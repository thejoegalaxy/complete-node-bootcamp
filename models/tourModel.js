const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');
//const User = require('./userModel'); //this was used when we embedded users into tour.

//Fat model, thin controller
//Tour Schema
const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
      maxlength: [40, 'A tour name must have at most 40 characters'],
      minlength: [10, 'A tour name must have at least 10 characters'],
      //validate: [validator.isAlpha, 'Tour name must only contain alpha characters']
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a maxGroupSize'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either: easy, medium, difficult',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          return val < this.price;
          //this will only work when creating a new document not on update.
          //real function to access this. return true
          //when priceDiscount < price. false when not to reject data.
        },
        message: 'Discount price ({VALUE}) must be less than price.',
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a summary description'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a imageCover'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false, //limit and exclude this from sending to client.
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
    startLocation: {
      //GeoJSON
      //embedded object.
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    //guides: Array, //this one was used when we were embedding from array of user id.
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User', //this ref. effectively creates the relationship.
      },
    ],
  },
  {
    //this will specifiy that the virtual data be included in output.
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

//virtual data, will be there when we get data.  calculated.
// business logic calcuated in the model not controller.
tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

//DOCUMENT MIDDLEWARE: runs before .save() and .create().
tourSchema.pre('save', function (next) {
  //this is the current document being processed before .save() and .create()
  //console.log(this)
  //note: slug must be a part of the schema to be persistent
  //for this .pre middleware to work.
  this.slug = slugify(this.name, { lower: true });
  next();
});

// tourSchema.pre('save', async function (next) {
//   //this will result in an array of promises.
//   // for each guide in guides find the user that matches by id.
//   const guidesPromises = this.guides.map(async (id) => await User.findById(id));
//   //this create an array of user documents from the array of promises
//   // and overrite the array of ids with an array of user documents. embedding those users
//   // that are guides for this tour.  Promise.all will run all the promises at the same time.
//   this.guides = await Promise.all(guidesPromises);

//   next();
// });
//pre save hook or pre save middleware
// tourSchema.pre('save', (next) => {
//     console.log('Will save document...');
//     next();
// })

// tourSchema.post('save', (doc, next) => {
//     //post has access to completed document with doc.
//     console.log(doc);
//     next();
// });

//QUERY MIDDLEWARE
// find find hook
//tourSchema.pre('find', function(next) {
//regular expression all functions that sart with find.
//so this will work for findbyone findbyid, etc.
tourSchema.pre(/^find/, function (next) {
  // this is now a query object so we can chain all the methods that we have for queries.
  //this query middleware will filter the secretTour(s) out..
  //console.log('find hook...')
  this.find({ secretTour: { $ne: true } });

  this.start = Date.now();
  next();
});

tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt', //only excluding passwordChangedAt??
  });

  next();
});

tourSchema.post(/^find/, function (docs, next) {
  console.log(`Query took ${Date.now() - this.start} ms`);
  //console.log(docs);
  next();
});

//AGGREGATION MIDDLEWARE
tourSchema.pre('aggregate', function (next) {
  //we are adding another element to the front of the array using unshift.
  // the aggregate we are adding is the same.
  // removing from the aggregate output all the doucments that have secretTour set to true.
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  console.log(this.pipeline());
  next();
});

//Tour model creation.
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
