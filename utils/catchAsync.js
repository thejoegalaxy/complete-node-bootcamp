// eslint-disable-next-line arrow-body-style
module.exports = fn => {
    return (req, res, next) => {
        //the below call to next will propagate the our global error handler.
        fn(req, res, next).catch(next);
    };
};
