const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const usersRoutes = require('./users');
const moviesRoutes = require('./movie');
const { createUser, login } = require('../controllers/users');
const auth = require('../middlewares/auth');
const CustomError = require('../utils/CustomError');
const ERROR_TEXT = require('../utils/constants');

router.post(
  '/signin',
  celebrate({
    body: Joi.object().keys({
      email: Joi.string().email().required(),
      password: Joi.string().required(),
    }),
  }),
  login,
);

router.post(
  '/signup',
  celebrate({
    body: Joi.object().keys({
      name: Joi.string().min(2).max(30),
      email: Joi.string().email().required(),
      password: Joi.string().required(),
    }),
  }),
  createUser,
);

router.use(auth);

router.use('/', usersRoutes);
router.use('/', moviesRoutes);
router.use('/', () => {
  throw new CustomError(404, ERROR_TEXT[404]);
});

module.exports = router;
