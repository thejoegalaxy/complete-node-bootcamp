const crypto = require('crypto');
const mongoose = require('mongoose');
//const slugify = require('slugify');
const validator = require('validator');
const bcrypt = require('bcryptjs');

//User Schema
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please tell us your name'],
      //unique: true,
      trim: true,
      //   maxlength: [32, 'A user name must have at most 32 characters'],
      //   minlength: [3, 'A user name must have at least 3 characters'],
      validate: {
        validator: function (val) {
          const value = val.split(' ').join('');
          return validator.isAlpha(value);
        },
        message: 'User name must only contain alpha characters',
      },
    },
    slug: String,
    email: {
      type: String,
      required: [true, 'Please provide your email address'],
      unique: true,
      lowercase: true,
      //trim: true,
      //   maxlength: [
      //     64,
      //     'A user must have an email address at most 64 characters',
      //   ],
      //   minlength: [7, 'A user must have an email address at least 7 characters'],
      validate: [validator.isEmail, 'Please provide a valid email address'],
    },
    photo: String,
    role: {
      type: String,
      enum: ['user', 'guide', 'lead-guide', 'admin'],
      default: 'user',
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      unique: false,
      trim: true,
      minlength: [8, 'A user password must have at least 8 characters'],
      select: false, //this will stop leaking out the password field.
      //   validate: [
      //     validator.isStrongPassword,
      //     'User must have a strong password',
      //   ],
    },
    passwordConfirm: {
      type: String,
      required: [true, 'Please confirm your password'],
      validate: {
        validator: function (el) {
          // This only works on SAVE!!!
          // .create or .save.
          // abc == abc, validation passed, otherwise return false
          // and we'll have a validation error.
          return el === this.password;
        },
        message: 'Passwords are not the same!',
      },
      //   trim: true,
      //   maxlength: [32, 'A user passwordConfirm must have at most 32 characters'],
      //   minlength: [8, 'A user passwordConfirm must have at least 8 characters'],
      //   validate: [
      //     validator.isStrongPassword,
      //     'User must have a strong passwordConfirm',
      //   ],
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
  }
  //   {
  //     //this will specifiy that the virtual data be included in output.
  //     toJSON: { virtuals: true },
  //     toObject: { virtuals: true },
  //   }
);

// encrypt Password before saving.
userSchema.pre('save', async function (next) {
  //Only run this function if password modified.
  if (!this.isModified('password')) return next();

  //Hash the password with cost of 12.
  this.password = await bcrypt.hash(this.password, 12);

  //delete this field.
  this.passwordConfirm = undefined;

  next();
});

//if the password has not been modified or this is a new document just return.
userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  //otherwise set passwordChangedAt to now.
  this.passwordChangedAt = Date.now() - 1000; //puts it 1 second in the past.
  next();
});

// compare candidate password with user password using bcrypt compare.
// instance method.
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  //same returns true.  false if password are not same.
  // candidatePassword not hashed.  userPassword is hashed.
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    //console.log(this.passwordChangedAt, JWTTimestamp);
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    //console.log(changedTimestamp, JWTTimestamp);
    return JWTTimestamp < changedTimestamp;
    // created JWTTimestamp at 100 < then changedTimestamp at 200, returns true.
    // meaning password was changed after.
  }
  //false means not changed.
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  //console.log('createPasswordResetToken');
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  console.log({ resetToken }, this.passwordResetToken);

  // 10 minute to expire.
  this.passwordResetExpires = Date.now() + 10 * 60 * 60 * 1000;

  return resetToken; //send the unencrypted password reset token via email.
};

//User model creation.
const User = mongoose.model('User', userSchema);

module.exports = User;
