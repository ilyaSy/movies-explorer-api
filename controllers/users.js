const validator = require('validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const CustomError = require('../utils/CustomError');

const { NODE_ENV, JWT_SECRET_KEY } = process.env;
const jwSecretKey = NODE_ENV === 'production' && JWT_SECRET_KEY ? JWT_SECRET_KEY : 'dev-secret';

module.exports.createUser = (req, res, next) => {
  const {
    name,
    email,
    password,
  } = req.body;

  if (!validator.isEmail(email)) {
    throw new CustomError(400, 'Некорректный email');
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
        throw new CustomError(409, 'Пользователь с таким email уже зарегистрирован');
      } else if (err.name === 'ValidationError') {
        throw new CustomError(500, 'На сервере произошла ошибка');
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
        throw new CustomError(401, 'Неправильные почта или пароль');
      }

      userId = user._id;

      return bcrypt.compare(password, user.password);
    })
    .then((matched) => {
      if (!matched) {
        throw new CustomError(401, 'Неправильные почта или пароль');
      }

      const token = jwt.sign({ _id: userId }, jwSecretKey, { expiresIn: '7d' });

      res.cookie('jwt', token, { maxAge: 1000 * 60 * 60 * 24 * 7, httpOnly: true }).send({ login: 'success' });
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
        throw new CustomError(404, 'Пользователь не найден');
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
        throw new CustomError(404, 'Пользователь не найден');
      } else if (err.name === 'CastError') {
        throw new CustomError(400, 'Переданы некорректные данные');
      }
      throw new CustomError(500, 'На сервере произошла ошибка');
    })
    .catch(next);
};
