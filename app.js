'use strict';

const express = require('express');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const models = require('./models/');
const indexRouter = require('./routes/index');
const electionsRouter = require('./routes/elections');

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

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

app.use('/', indexRouter);
app.use('/elections', electionsRouter);

module.exports = app;
