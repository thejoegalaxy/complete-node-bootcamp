const mongoose = require('mongoose');
const slugify = require('slugify');
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
      validate: [
        validator.isAlpha,
        'User name must only contain alpha characters',
      ],
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
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      unique: false,
      trim: true,
      //      minlength: [8, 'A user password must have at least 8 characters'],
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

//User model creation.
const User = mongoose.model('User', userSchema);

module.exports = User;
