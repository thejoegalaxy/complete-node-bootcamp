const fs = require('fs');

//read once into variable tours.
const tours = JSON.parse(
    fs.readFileSync(`${__dirname}/../starter/dev-data/data/tours-simple.json`)
);


// Route Handlers
exports.getAllTours = (req, res) => {
    //formatted using jsend specification.
    console.log(req.requestTime);

    res.status(200).json({ 
        status: 'success',
        requestedAt: req.requestTime, //setting header property for requesteAt time.
        results: tours.length, //size of array.
        data: {
            tours
        }
    });
};

exports.updateTour = (req, res) => {
    
    if (req.params.id * 1 > tours.length) {
        return res.status(404).send({
            status: 'failed',
            message: 'Invalid ID'
        })
    }

    res.status(200).json({
        status: 'success',
        data:  { 
            tour: '<Updated tour here...>'
        }
    })
};

exports.deleteTour = (req, res) => {
    
    if (req.params.id * 1 > tours.length) {
        return res.status(404).send({
            status: 'failed',
            message: 'Invalid ID'
        })
    }

    //204, no content.
    res.status(204).json({
        status: 'success',
        data:  null
    })
};

exports.createTour = (req, res) => {
    // middleware 
    //calculate newId by getting last tour id in array and incrementing.
    const newId = tours[tours.length - 1].id + 1;
    // create new object with newid and tour object sent by POST.
    const newTour = Object.assign({id: newId}, req.body);

    // push newTour into the tour array.
    tours.push(newTour);

    // write stringify JSON object to file.
    fs.writeFile(`${__dirname}/starter/dev-data/data/tours-simple.json`, JSON.stringify(tours), err => {
        
        //send response 201 and new tour object back to client.
        res.status(201).json({
            status: 'success',
            data: {
                tour: newTour
            }
        })
    })
    //res.send('Done');

};

exports.getTour = (req, res) => {
    console.log(req.params);

    const id = req.params.id * 1;

    const tour = tours.find(el => el.id === id)

    if (!tour) {
        return res.status(404).send({
            status: 'failed',
            message: 'Invalid ID'
        })
    }

    //formatted using jsend specification.
    res.status(200).json({ 
        status: 'success',
        results: tours.length, //size of array.
        data: {
            tour
        }
    });
};
