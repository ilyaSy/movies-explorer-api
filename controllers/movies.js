const Movie = require('../models/movie');
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
    .then((card) => {
      if (card.owner.toString() !== userId) {
        throw Error('BadRules');
      }

      Movie.findByIdAndRemove(movieId)
        .then((movieRemoved) => res.send(movieRemoved))
        .catch((err) => {
          if (err.name === 'CastError') {
            throw new CustomError(400, 'Переданы некорректные данные');
          }
          throw new CustomError(500, 'На сервере произошла ошибка');
        })
        .catch(next);
    })
    .catch((err) => {
      if (err.message === 'NoData') {
        throw new CustomError(404, 'Фильм не найден');
      }
      if (err.message === 'BadRules') {
        throw new CustomError(403, 'У вас нет прав удалять фильмы других пользователей');
      }
      throw new CustomError(500, 'На сервере произошла ошибка');
    })
    .catch(next);
};

module.exports.createMovie = (req, res, next) => {
  const {
    country,
    director,
    duration,
    year,
    description,
    image,
    trailer,
    thumbnail,
    movieId,
    nameRU,
    nameEN,
  } = req.body;
  const userId = req.user._id;

  Movie.create({
    country,
    director,
    duration,
    year,
    description,
    image,
    trailer,
    thumbnail,
    movieId,
    nameRU,
    nameEN,
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
        throw new CustomError(404, 'Фильм не найдена');
      } else if (err.name === 'CastError') {
        throw new CustomError(400, 'Переданы некорректные данные');
      }
      throw new CustomError(500, 'На сервере произошла ошибка');
    })
    .catch(next);
};
