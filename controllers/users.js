const validator = require('validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const { jwtSecretKey } = require('../utils/config');
const CustomError = require('../utils/CustomError');
const ERROR_TEXT = require('../utils/constants');

module.exports.createUser = (req, res, next) => {
  const {
    name,
    email,
    password,
  } = req.body;

  if (!validator.isEmail(email)) {
    throw new CustomError(400, ERROR_TEXT['400_email']);
  }

  bcrypt.hash(password, 10).then((hash) => User.create({
    name,
    email,
    password: hash,
  })
    .catch((err) => {
      if (err.errors && err.errors.avatar) {
        throw new CustomError(400, err.errors.avatar.message);
      }
      if (err.name === 'MongoError' && err.code === 11000) {
        throw new CustomError(409, ERROR_TEXT[409]);
      } else if (err.name === 'ValidationError') {
        throw new CustomError(500, ERROR_TEXT[500]);
      }
    }))
    .then((user) => res.send({
      data: {
        name: user.name,
        email: user.email,
      },
    }))
    .catch(next);
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;

  let userId;
  User.findOne({ email }).select('+password')
    .then((user) => {
      if (!user) {
        throw new CustomError(401, ERROR_TEXT[401]);
      }

      userId = user._id;

      return bcrypt.compare(password, user.password);
    })
    .then((matched) => {
      if (!matched) {
        throw new CustomError(401, ERROR_TEXT[401]);
      }

      const token = jwt.sign({ _id: userId }, jwtSecretKey, { expiresIn: '7d' });

      res.cookie('jwt', token, { maxAge: 1000 * 60 * 60 * 24 * 7, httpOnly: true }).send({ login: 'success' });
    })
    .catch(next);
};

module.exports.logout = (req, res, next) => {
  const userId = req.user._id;

  User.findById(userId)
    .then((user) => {
      if (!user) {
        throw new CustomError(404, ERROR_TEXT['404_user']);
      }

      res.cookie('jwt', '', { expires: new Date(1970, 0, 0), httpOnly: true }).send({ signout: 'success' });
    })
    .catch(next);
};

module.exports.getMe = (req, res, next) => {
  const userId = req.user._id;

  User.findById(userId)
    .orFail(new Error('NoData'))
    .then((user) => res.send({ data: user }))
    .catch((err) => {
      if (err.message === 'NoData') {
        throw new CustomError(404, ERROR_TEXT['404_user']);
      }
    })
    .catch(next);
};

module.exports.updateProfile = (req, res, next) => {
  const userId = req.user._id;
  const { name, email } = req.body;

  User.findByIdAndUpdate(
    userId,
    { name, email },
    {
      new: true,
      runValidators: true,
    },
  )
    .orFail(new Error('NoData'))
    .then((user) => res.send(user))
    .catch((err) => {
      if (err.message === 'NoData') {
        throw new CustomError(404, ERROR_TEXT['404_user']);
      } else if (err.name === 'CastError') {
        throw new CustomError(400, ERROR_TEXT[400]);
      }
      throw new CustomError(500, ERROR_TEXT[500]);
    })
    .catch(next);
};
