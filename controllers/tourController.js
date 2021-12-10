//const fs = require('fs');
const Tour = require("../models/tourModel");

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

exports.checkBody = (req, res, next) => {
    if(!req.body.name || !req.body.price) {
        return res.status(400).json({
            status: 'failed',
            message: 'missing name or price'
        })
    }
    console.log('Hello from checkBody, passed...')
    next();
};

// Route Handlers
exports.getAllTours = (req, res) => {
    //formatted using jsend specification.
    console.log(req.requestTime);

    res.status(200).json({ 
        status: 'success',
        requestedAt: req.requestTime, //setting header property for requesteAt time.
        // results: tours.length, //size of array.
        // data: {
        //     tours
        // }
    });
};

exports.updateTour = (req, res) => {
    res.status(200).json({
        status: 'success',
        data:  { 
            tour: '<Updated tour here...>'
        }
    })
};

exports.deleteTour = (req, res) => {    //204, no content.
    res.status(204).json({
        status: 'success',
        data:  null
    })
};

exports.createTour = (req, res) => {
    //send response 201 and new tour object back to client.
    res.status(201).json({
        status: 'success',
        // data: {
        //     tour: newTour
        // }
    })
    // middleware 
    //calculate newId by getting last tour id in array and incrementing.
    // const newId = tours[tours.length - 1].id + 1;
    // // create new object with newid and tour object sent by POST.
    // const newTour = {id: newId, ...req.body};

    // // push newTour into the tour array.
    // tours.push(newTour);

    // // write stringify JSON object to file.
    // fs.writeFile(`${__dirname}/starter/dev-data/data/tours-simple.json`, JSON.stringify(tours), err => {
        
    //     //send response 201 and new tour object back to client.
    //     res.status(201).json({
    //         status: 'success',
    //         data: {
    //             tour: newTour
    //         }
    //     })
    // })
    //res.send('Done');

};

exports.getTour = (req, res) => {
    console.log(req.params);

    //const id = req.params.id * 1;

    // const tour = tours.find(el => el.id === id)
    // //formatted using jsend specification.
    // res.status(200).json({ 
    //     status: 'success',
    //     results: tours.length, //size of array.
    //     data: {
    //         tour
    //     }
    // });
};
