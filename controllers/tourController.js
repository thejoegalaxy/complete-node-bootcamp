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
        //console.log(req.query);

        //BUILD QUERY
        // 1a. Filtering
        //make a copy of the query object.
        const queryObj = {...req.query};
        //array of fields that we want to delete from queryObj.
        const excludedFields = ['page', 'sort', 'limit', 'fields'];
        //for each field in excludedFields, delete it from the queryObj
        //ForEach because we don't want to save a new array
        excludedFields.forEach(el => delete queryObj[el]);

        //console.log(req.query, queryObj);
        
        //mongoose methods.
        //find returns a query that's why we are able to chain the below methods.

        // 1b. Advanced filtering.
        //convert obj to string.
        // use let so we can transmute queryStr.
        let queryStr = JSON.stringify(queryObj);

        //{ duration: { gte: '5' }, difficulty: 'easy' }
        // { difficulty: 'easy', duration: {$gte: 5}}
        // gte, gt, lte, lt
        // \b any of these, /g all occurances, 
        // replace the match with $match
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
        //console.log(JSON.parse(queryStr));
        
        let query = Tour.find(JSON.parse(queryStr));

        //2. Sorting, sort=-, on the query will cause a descending sort.
        if(req.query.sort){
            const sortBy = req.query.sort.split(',').join(' ');
            //console.log(sortBy);
            query = query.sort(sortBy);
            // sort('price ratingsAverage')
        } else {
            //default sort criteria, if none specified.
            //query = query.sort('-createdAt');
            //had to adjust default sorting to _id for paging to work.
            query = query.sort('_id')
        }

        // 3. Field limiting.
        if(req.query.fields) {
            console.log('field limiting...')
            const fields = req.query.fields.split(',').join(' ');
            query = query.select(fields);
        } else {
            //default.
            // - minus prefix excludes that field.
            query = query.select('-__v');
        }

        //4. Paginations.
        //page=2&limit=10, page 1: 1-10, page 2: 11-20, page 3 21-30
        //we will calculate the skip value based on page value
        const page = req.query.page * 1 || 1;
        const limit = req.query.limit * 1 || 100;
        const skip = (page-1) * limit;
        //console.log(page);
        //console.log(skip);

        query = query.skip(skip).limit(limit);

        //check if paging beyond number of available pages.
        if(req.query.page) {
            const numTours = await Tour.countDocuments();
            if(skip >= numTours) throw new Error('This page does not exist');
        }

        //EXECUTE QUERY
        const tours = await query;
        //query.sort().select().skip().limit();
        //each of these queries returns a object and we can chain them.
        // by await.

        
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
            message: err.message
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
