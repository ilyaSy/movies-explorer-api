const jwt = require('jsonwebtoken');
const CustomError = require('../utils/CustomError');
const ERROR_TEXT = require('../utils/constants');
const { jwtSecretKey } = require('../utils/config');

module.exports = (req, res, next) => {
  const token = req.cookies.jwt;
  if (!token) {
    throw new CustomError(401, ERROR_TEXT['401_auth']);
  }

  let payload;

  try {
    payload = jwt.verify(token, jwtSecretKey);
  } catch (err) {
    throw new CustomError(401, ERROR_TEXT['401_auth']);
  }

  req.user = payload;
  next();
};
