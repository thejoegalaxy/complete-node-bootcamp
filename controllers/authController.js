const crypto = require('crypto');
const { promisify } = require('util'); //destructuring
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Email = require('../utils/email');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, req, res) => {
  const token = signToken(user._id);

  // const cookieOptions = {
  //   expires: new Date(
  //     Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
  //   ),
  //   //secure: true, //https only; we only want this option in production.
  //   httpOnly: true, //receive and store only.
  //   secure: req.secure || req.headers['x=forwarded-proto'] === 'https',
  // };

  //console.log(cookieOptions);

  //if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  //console.log(token);
  res.cookie('jwt', token, {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    //secure: true, //https only; we only want this option in production.
    httpOnly: true, //receive and store only.
    secure: req.secure || req.headers['x=forwarded-proto'] === 'https', //heroku proxy forward.
  });

  //remove password from the output.
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token, // send the created token to user. This logs the user in.
    data: {
      user,
    },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create(req.body);

  const url = `${req.protocol}://${req.get('host')}/me`;
  //console.log(url);
  await new Email(newUser, url).sendWelcome();

  createSendToken(newUser, 201, req, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  //console.log(email);

  // 1. check if email & password exists.
  if (!email || !password) {
    return next(new AppError('Please provide an email and password', 400));
  }
  // 2. check if there is a user for the email that is posted ;exists & password is correct.
  const user = await User.findOne({ email }).select('+password');

  //console.log(password, user.password);

  // if there's no user the || right side will not execute.
  // if there's a wrong password or no user, create an global error.
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  // 3. if everything is ok, send the token to client.
  createSendToken(user, 200, req, res);
});

//sending a cookie with the same name, dummy text, 10 sec expiry.
exports.logout = function (req, res) {
  //console.log('from logout');
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ status: 'success' });
};

//protect routes.
exports.protect = catchAsync(async (req, res, next) => {
  //console.log(req.headers);
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
  } else if (req.cookies.jwt) {
    //if the token wasn't in the authorization header
    //check if it is in the jwt cookie.
    token = req.cookies.jwt;
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
  res.locals.user = currentUser;
  //a way to share from middleware to middleware req.user.
  //also .locals.user will share with all templates.

  next();
});

//for rendered pages..no errors!
//removed catchAsync from this middleware, and catch locally and say next();
exports.isLoggedIn = async (req, res, next) => {
  //console.log(req.headers);
  if (req.cookies.jwt) {
    try {
      // 1. Validate the token, Verification
      // we will promisify this..
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );
      //console.log(decoded.iat);

      // 2. Check if user still exists.
      const currentUser = await User.findById(decoded.id);
      //console.log(decoded);

      if (!currentUser) {
        return next();
      }
      //3. Check if user changed password after the token was issued.
      if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next();
      }

      //THERE IS A LOGGED IN USER
      //next leads us to the next route handler which is to grant access to the protected route.
      // we can put any variables in res.locals., such as res.locals.user, our all pug will have access to it.
      res.locals.user = currentUser;
      //console.log(currentUser);
      return next();
    } catch (err) {
      //console.log('isLoggedIn error.');
      return next();
    }
  }
  //in case there is no cookie.
  next();
};

// passing in roles who have restricted permissions.
exports.restrictTo =
  (...roles) =>
  (req, res, next) => {
    //roles ['admin', 'lead-guide'].  role='user'.
    //if req.user.role is not in the array of restricted permissions then error.
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }

    next();
  };

exports.forgotPassword = catchAsync(async (req, res, next) => {
  //console.log(req.body.email);

  // 1. Get user based on posted email.
  const user = await User.findOne({ email: req.body.email });

  //console.log(user);

  if (!user) {
    return next(new AppError('There is no user with that email address.', 404));
  }
  // 2. Generate the random reset token.
  const resetToken = user.createPasswordResetToken();
  //save random reset token to database.
  //await user.save({ validateBeforeSave: false });
  await user.save({ validateBeforeSave: false });
  //console.log('successfully saved reset token');

  //const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;

  try {
    // 3. Send it to user's email address.
    const resetURL = `${req.protocol}://${req.get(
      'host'
    )}/api/v1/users/resetPassword/${resetToken}`;

    await new Email(user, resetURL).sendPasswordReset();

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!',
    });
  } catch (err) {
    //if some error sending tokenreset email.
    user.createPasswordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError(
        'There was an error sending the email.  Please try again later!'
      ),
      500
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  //1. get user based on token.
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  //also need to check if the passwordResetExpires property is greater than now.
  //which would mean it is in the future, which means it hasn't expired yet.
  //find the user for the token and check if the token has expired.
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gte: Date.now() },
  });

  //2. If token has not expired, and there is a user, set the new password
  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined; //delete reset token
  user.passwordResetExpires = undefined; //delete expired.
  //console.log(user);
  await user.save();
  //we always use save with passwords because we want to run the validators & middlware.

  //3. Update changedPasswordAt property for the user.
  //user.changedPasswordAt = Date.now();
  //4. Log the user in, send JWT
  // 3. if everything is ok, send the token to client.
  createSendToken(user, 200, req, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  //console.log(req.body);

  // 1. Get user from collection
  const user = await User.findById(req.user.id).select('+password');

  // 2. check if posted password is correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('Your current password is incorrect.', 401));
  }

  // If so, update password.
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();
  //User.findByIdAndUpdate will NOT work as intended!
  //validators and middleware for passwords won't run.

  // Log user in, send JWT
  // 3. if everything is ok, send the token to client.
  createSendToken(user, 200, req, res);
});
