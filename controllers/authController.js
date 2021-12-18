const { promisify } = require('util'); //destructuring
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
    role: req.body.role,
  });

  // create the token. imported jsonwebtoken above.
  // JWT_SECRET & JWT_EXPIRATION are in config.env.
  const token = signToken({ id: newUser._id });

  //console.log(token);

  res.status(201).json({
    status: 'success',
    token, // send the created token to user. This logs the user in.
    data: {
      user: newUser,
    },
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1. check if email & password exists.
  if (!email || !password) {
    return next(new AppError('Please provide an email and password', 400));
  }
  // 2. check if there is a user for the email that is posted ;exists & password is correct.
  const user = await User.findOne({ email }).select('+password');

  // if there's no user the || right side will not execute.
  // if there's a wrong password or no user, create an global error.
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  // 3. if everything is ok, send the token to client.
  const token = signToken(user._id);
  res.status(200).json({
    status: 'success',
    token,
  });
});

//protect routes.
exports.protect = catchAsync(async (req, res, next) => {
  let token;
  // 1. Getting token and check if it's there.
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    //can't define a variable in the if block because it will lose scope.
    //es6 blocked scope.
    //hence declare above: let token;
    token = req.headers.authorization.split(' ')[1];
  }

  //console.log(token);

  if (!token) {
    return next(
      new AppError('You are not logged in!  Please log in to gain access.', 401)
    );
  }
  // 2. Validate the token, Verification
  // we will promisify this..
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  //console.log(decoded.iat);
  // 3. Check if user still exists.
  const currentUser = await User.findById(decoded.id);
  //console.log(decoded);

  if (!currentUser) {
    return next(
      new AppError('The user belonging to this token no longer exists'),
      401
    );
  }
  //4. Check if user changed password after the token was issued.
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password! Please login again.', 401),
      401
    );
  }

  //Grant access to protected route.
  //next leads us to the next route handler which is to grant access to the protected route.
  req.user = currentUser;
  //a way to share from middleware to middleware req.user.

  next();
});

exports.restrictTo =
  (...roles) =>
  (req, res, next) => {
    //roles ['admin', 'lead-guide'].  role='user'.
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }

    next();
  };
