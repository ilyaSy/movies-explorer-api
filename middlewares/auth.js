const jwt = require('jsonwebtoken');
const CustomError = require('../utils/CustomError');

const { NODE_ENV, JWT_SECRET_KEY } = process.env;
const jwSecretKey = NODE_ENV === 'production' && JWT_SECRET_KEY ? JWT_SECRET_KEY : 'dev-secret';

module.exports = (req, res, next) => {
  // const { authorization } = req.headers;
  // if (!authorization || !authorization.startsWith('Bearer ')) {
  // throw new CustomError(401, 'Необходима авторизация');
  // }

  // const token = authorization.replace('Bearer ', '');

  const token = req.cookies.jwt;
  if (!token) {
    throw new CustomError(401, 'Необходима авторизация');
  }

  let payload;

  try {
    payload = jwt.verify(token, jwSecretKey);
  } catch (err) {
    throw new CustomError(401, 'Необходима авторизация');
  }

  req.user = payload;
  next();
};
