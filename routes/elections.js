'use strict';

const express = require('express');
const helper = require('../helper');

const router = express.Router();
const orm = require('orm');

router.get('/', function(req, res, next) {
  const cursor = helper.parseInt(req.query.cursor);
  const limit = helper.pageSize(req.query.limit);

  const conditions = { id: orm.gt(cursor), disabled: false };
  req.models.elections.find(conditions, { limit }, function(err, elections) {
    if (err) {
      return next(err);
    }

    res.json({ code: 200, message: 'success', data: { elections } });
  });
});

router.get('/:id', function(req, res, next) {
  const { id } = req.params;
  req.models.elections.one({ id, disabled: false }, function(err, election) {
    if (err) {
      return next(err);
    }

    if (!election) {
      return res.status(404).json({ message: 'resource not found' });
    }

    res.json({ code: 200, message: 'success', data: { election } });
  });
});

module.exports = router;
