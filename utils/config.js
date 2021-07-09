require('dotenv').config();

const {
  PORT = 3000,
  DB_HOST,
  DB,
  DB_PORT,
  NODE_ENV,
  JWT_SECRET_KEY,
} = process.env;

const dbPort = NODE_ENV === 'production' && DB_PORT ? DB_PORT : 27017;
const dbHost = NODE_ENV === 'production' && DB_HOST ? DB_HOST : 'localhost';
const db = NODE_ENV === 'production' && DB ? DB : 'bitfilmsdb';

const mongoDbConnectURL = `mongodb://${dbHost}:${dbPort}/${db}`;

const jwtSecretKey = NODE_ENV === 'production' && JWT_SECRET_KEY ? JWT_SECRET_KEY : 'dev-secret';

const mongoDbOptions = {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
};

const corsOptions = {
  origin: [
    'http://ilya.nomoredomains.club',
    'https://ilya.nomoredomains.club',
    'http://localhost:3000',
  ],
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
  preflightContinue: false,
  optionsSuccessStatus: 204,
  allowedHeaders: ['Content-Type', 'origin', 'Authorization'],
  credentials: true,
};

const regExpUrl = /^https?:\/\/(www\.)?[a-zA-Z0-9@:%._+~#=]{2,256}\.([a-z]{2,6})([a-zA-Z0-9-._~:/?#[\]@!$&'()*+,;=]*)$/;

module.exports = {
  PORT,
  jwtSecretKey,
  corsOptions,
  mongoDbConnectURL,
  mongoDbOptions,
  regExpUrl,
};
