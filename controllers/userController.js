const multer = require('multer'); // will use to upload files.
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./handlerFactory');

const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'starter/public/img/users');
  },
  filename: (req, file, cb) => {
    //user-userid-timestamp.jpeg
    //user-7575757-333222.jpeg
    const ext = file.mimetype.split('/')[1];
    cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
  },
});

const multerFilter = (req, file, cb) => {
  //test if the uploaded file is an image. pass true if it is, false if not to cb.
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images.', 400), false);
  }
};

// our current architecture, we store the image files on our hard drive with a link to them save in our database.
//const upload = multer({ dest: 'starter/public/img/users' }); //provide multer an object with upload dest.
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadUserPhoto = upload.single('photo');

//passing in req.body object & a list of allowed fields: name, email.
// for each element in req.body if that element is included in allowedFields: name, email,
// include it in newObject.  This filters the given object to only include allowed fields.
const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.updateMe = catchAsync(async (req, res, next) => {
  console.log(req.file);
  console.log(req.body);
  // 1. create error if user POSTs password data.
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password updates.  Please use /updateMyPassword.',
        400
      )
    );
  }

  // 2. Update user document.
  // we can use findByIdAndUpdate here because we are not using sensitive data like password.
  // we will filter the req.body data and only allow updating of name & email by creating filteredBody.
  // in the future we might add more fields like image, etc.
  const filteredBody = filterObj(req.body, 'name', 'email');

  console.log(filteredBody);

  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true, //return the updated user object.
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not defined! Please use /signup instead.',
  });
};

// TODO: need to add permissions to admin only to delete user.
// update also only for administrators.
//Do Not update passwords with this.
exports.deleteUser = factory.deleteOne(User);
exports.updateUser = factory.updateOne(User);
exports.getAllUsers = factory.getAll(User);
exports.getUser = factory.getOne(User);
