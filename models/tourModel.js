const mongoose = require('mongoose');
const slugify = require('slugify');

//Tour Schema
const tourSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A tour must have a name'],
        unique: true,
        trim: true
    },
    slug: String,
    duration: {
        type: Number,
        required: [true, 'A tour must have a duration']
    },
    maxGroupSize: {
        type: Number,
        required: [true, 'A tour must have a maxGroupSize']
    },
    difficulty: {
        type: String,
        required: [true, 'A tour must have a difficulty']
    },
    ratingsAverage: {
        type: Number,
        default: 4.5
    },
    ratingsQuantity: {
        type: Number,
        default: 0
    },
    price: {
        type: Number,
        required: [true,'A tour must have a price']
    },
    priceDiscount: Number,
    summary: {
        type: String,
        trim: true,
        required: [true,'A tour must have a summary description']
    },
    description: {
        type: String,
        trim: true
    },
    imageCover: {
        type: String,
        required: [true,'A tour must have a imageCover']
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
        default: false
    }
}, 
{ //this will specifiy that the virtual data be included in output.
    toJSON: {virtuals: true},
    toObject: {virtuals: true}
});

//virtual data, will be there when we get data.  calculated.
// business logic calcuated in the model not controller.
tourSchema.virtual('durationWeeks').get(function() {
    return this.duration / 7;
})

//DOCUMENT MIDDLEWARE: runs before .save() and .create().
tourSchema.pre('save', function(next) {
    //this is the current document being processed before .save() and .create()
    //console.log(this)
    //note: slug must be a part of the schema to be persistent
    //for this .pre middleware to work.
    this.slug = slugify(this.name, {lower: true});
    next();
});

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
tourSchema.pre(/^find/, function(next) {
    // this is now a query object so we can chain all the methods that we have for queries.
    //this query middleware will filter the secretTour(s) out..
    //console.log('find hook...')
    this.find({secretTour: { $ne: true } })

    this.start = Date.now();
    next();
});

tourSchema.post(/^find/, function(docs, next) {
    console.log(`Query took ${Date.now() - this.start} ms`);
    //console.log(docs);
    next();
});

//Tour model creation.
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;