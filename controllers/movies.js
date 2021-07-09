const Movie = require('../models/movie');
const ERROR_TEXT = require('../utils/constants');
const CustomError = require('../utils/CustomError');

module.exports.getMovies = (req, res, next) => {
  Movie.find({})
    .populate('owner')
    .then((movies) => res.send(movies))
    .catch(next);
};

module.exports.deleteMovie = (req, res, next) => {
  const { movieId } = req.params;
  const userId = req.user._id;

  Movie.findById(movieId)
    .orFail(() => {
      throw Error('NoData');
    })
    .then((movie) => {
      if (movie.owner.toString() !== userId) {
        throw Error('BadRules');
      }

      Movie.findByIdAndRemove(movieId)
        .then((movieRemoved) => res.send(movieRemoved))
        .catch((err) => {
          if (err.name === 'CastError') {
            throw new CustomError(400, ERROR_TEXT[400]);
          }
          throw err;
        })
        .catch(next);
    })
    .catch((err) => {
      if (err.message === 'NoData') {
        throw new CustomError(404, ERROR_TEXT['404_movie']);
      }
      if (err.message === 'BadRules') {
        throw new CustomError(403, ERROR_TEXT[403]);
      }
      throw err;
    })
    .catch(next);
};

module.exports.createMovie = (req, res, next) => {
  const userId = req.user._id;

  Movie.create({
    ...req.body,
    owner: userId,
  })
    .then((cardCreated) => {
      const card = cardCreated;
      card.owner = req.user;
      return res.send(card);
    })
    .catch((err) => {
      if (err.errors && err.errors.link) {
        throw new CustomError(400, err.errors.link.message);
      }
      if (err.message === 'NoData') {
        throw new CustomError(404, ERROR_TEXT['404_movie']);
      } else if (err.name === 'CastError') {
        throw new CustomError(400, ERROR_TEXT[400]);
      }
      throw err;
    })
    .catch(next);
};
