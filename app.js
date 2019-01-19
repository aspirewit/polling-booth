'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const expressJwt = require('express-jwt');

const settings = require('./config/settings');
const models = require('./models/');
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const electionsRouter = require('./routes/elections');

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// Integrate ORM
app.use(function(req, res, next) {
  models(function(err, db) {
    if (err) {
      return next(err);
    }

    req.models = db.models;
    req.db = db;

    return next();
  });
});

// Integrate JWT
app.use(expressJwt({
  secret: settings.jwt.secret,
}).unless({
  path: [
    '/',
    '/users/verification-code',
    '/users/register',
    '/users/login',
  ],
}));

// Set the req.loggedInUser with the current user
app.use(function(req, res, next) {
  if (!req.user.id) {
    return next();
  }

  req.models.users.get(req.user.id, function(err, user) {
    if (user) {
      req.loggedInUser = user;
    }

    next();
  });
});

// Error handling
app.use(function(err, req, res, next) {
  if (err.name === 'UnauthorizedError') {
    res.status(401).json({ message: 'you have not login yet' });
  }

  next();
});

// Routers
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/elections', electionsRouter);

module.exports = app;
