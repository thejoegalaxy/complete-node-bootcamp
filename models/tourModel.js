const mongoose = require('mongoose');

//Tour Schema
const tourSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A tour must have a name'],
        unique: true,
        trim: true
    },
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
    startDates: [Date]
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

//Tour model creation.
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;