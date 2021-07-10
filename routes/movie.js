const { Joi, celebrate } = require('celebrate');
const router = require('express').Router();
const { regExpUrl } = require('../utils/config');
const {
  getMovies,
  createMovie,
  deleteMovie,
} = require('../controllers/movies');

router.get('/movies', getMovies);

router.post(
  '/movies',
  celebrate({
    body: Joi.object().keys({
      country: Joi.string().required().min(2),
      director: Joi.string().required(),
      duration: Joi.number().required(),
      year: Joi.string().required(),
      description: Joi.string().required(),
      image: Joi.string().regex(regExpUrl).required(),
      trailer: Joi.string().regex(regExpUrl).required(),
      thumbnail: Joi.string().regex(regExpUrl).required(),
      movieId: Joi.number().required(),
      nameRU: Joi.string().required(),
      nameEN: Joi.string().required(),
    }),
  }),
  createMovie,
);

router.delete(
  '/movies/:movieId',
  celebrate({
    params: Joi.object().keys({
      movieId: Joi.string().hex().required().length(24),
    }),
  }),
  deleteMovie,
);

module.exports = router;
