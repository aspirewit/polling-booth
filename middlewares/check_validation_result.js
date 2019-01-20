'use strict';

const { validationResult } = require('express-validator/check');

module.exports = function() {
  return function(req, res, next) {
    const errors = validationResult(req);

    if (errors.isEmpty()) {
      next();
    } else {
      res.status(422).json({ errors: errors.array() });
    }
  };
};
