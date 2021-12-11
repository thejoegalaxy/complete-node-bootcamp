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


// Route Handlers
exports.getAllTours = async (req, res) => {
    try{
        //BUILD QUERY
        //make a copy of the query object.
        const queryObj = {...req.query};
        //array of fields that we want to delete from queryObj.
        const excludedFields = ['page', 'sort', 'limit', 'fields'];
        //for each field in excludedFields, delete it from the queryObj
        //ForEach because we don't want to save a new array
        excludedFields.forEach(el => delete queryObj[el]);

        console.log(req.query, queryObj);
        
        //mongoose methods.
        //find returns a query that's why we are able to chain the below methods.

        const query = Tour.find(queryObj);
            // .where('duration')
            // .equals(5)
            // .where('difficulty')
            // .equals('easy');

        //EXECUTE QUERY
        const tours = await query;

        //SEND RESPONSE
        res.status(200).json({ 
            status: 'success',
            //requestedAt: req.requestTime, //setting header property for requesteAt time.
            results: tours.length, //size of array.
            // send all tours as the data.
            data: {
                tours
            }
        });
    }catch (err) {
        res.status(404).json({
            status: 'fail',
            message: err
        });
    }
};

exports.updateTour = async (req, res) => {
    try{
        const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            status: 'success',
            data:  { 
                tour
            }
        })

    }catch (err) {
        res.status(404).json({
            status: 'fail',
            message: 'Invalid data sent!'
        })
    }
    
};

exports.deleteTour = async (req, res) => {    //204, no content.
    try{
        await Tour.findByIdAndDelete(req.params.id);
        res.status(204).json({
        status: 'success',
        data:  null
        });
    }catch (err) {
        res.status(404).json({
            status: 'fail',
            message: 'Invalid data sent!'
        });
    }
};

exports.createTour = async (req, res) => {
    try{
        const newTour = await Tour.create(req.body);
        //send response 201 and new tour object back to client.
        res.status(201).json({
            status: 'success',
            data: {
                tour: newTour
            }
        })
    }catch(err) {
        res.status(404).json({
            status: 'fail',
            message: err
        })
    }
    
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

exports.getTour = async (req, res) => {
    try {
        //Tour.findOne({_id: req.params.id})
        const tour = await Tour.findById(req.params.id);
        res.status(200).json({
            status: 'success',
            data: {
                tour
            }
        })
    }catch (err) {
        res.status(404).json({
            status: 'fail',
            message: 'Invalid data sent!'
        })
    }
};
