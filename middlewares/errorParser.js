const ERROR_TEXT = require('../utils/constants');

module.exports.errorParser = (err, req, res, next) => {
  const { statusCode = 500, message } = err;

  res.status(statusCode).send({
    message: statusCode === 500 ? ERROR_TEXT[500] : message,
  });
  next();
};
