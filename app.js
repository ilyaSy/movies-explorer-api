require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const { errors } = require('celebrate');
const {
  PORT,
  corsOptions,
  mongoDbConnectURL,
  mongoDbOptions,
} = require('./utils/config');
const routes = require('./routes/index');
const limiter = require('./middlewares/rateLimiter');
const { requestLogger, errorLogger } = require('./middlewares/logger');
const { errorParser } = require('./middlewares/errorParser');

mongoose.connect(mongoDbConnectURL, mongoDbOptions);

const app = express();
app.listen(PORT);

app.use('*', cors(corsOptions));
app.use(requestLogger);
app.use(limiter);
app.use(bodyParser.json());
app.use(cookieParser());
app.use('/', routes);
app.use(errorLogger);
app.use(errors());
app.use(errorParser);
