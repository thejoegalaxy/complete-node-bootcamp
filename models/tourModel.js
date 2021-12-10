const mongoose = require('mongoose');

//Tour Schema
const tourSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A tour must have a name'],
        unique: true
    },
    rating: {
        type: Number,
        default: 4.5
    },
    price: {
        type: Number,
        required: [true,'A tour must have a price']
    }
});

//Tour model creation.
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;