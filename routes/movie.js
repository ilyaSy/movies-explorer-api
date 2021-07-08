const { Joi, celebrate } = require('celebrate');
const router = require('express').Router();

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
      image: Joi.string()
        .regex(/^https?:\/\/(www\.)?[a-zA-Z0-9@:%._+~#=]{2,256}\.([a-z]{2,6})([a-zA-Z0-9-._~:/?#[\]@!$&'()*+,;=]*)$/)
        .required(),
      trailer: Joi.string()
        .regex(/^https?:\/\/(www\.)?[a-zA-Z0-9@:%._+~#=]{2,256}\.([a-z]{2,6})([a-zA-Z0-9-._~:/?#[\]@!$&'()*+,;=]*)$/)
        .required(),
      thumbnail: Joi.string()
        .regex(/^https?:\/\/(www\.)?[a-zA-Z0-9@:%._+~#=]{2,256}\.([a-z]{2,6})([a-zA-Z0-9-._~:/?#[\]@!$&'()*+,;=]*)$/)
        .required(),
      movieId: Joi.string().required(),
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
      //  movieId: Joi.string().hex().required().length(24),
      movieId: Joi.string().required(),
    }),
  }),
  deleteMovie,
);

module.exports = router;
