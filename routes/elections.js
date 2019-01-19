'use strict';

const express = require('express');
const helper = require('../helper');

const router = express.Router();
const orm = require('orm');

router.get('/', function(req, res) {
  const cursor = helper.parseInt(req.query.cursor);
  const limit = helper.pageSize(req.query.limit);

  const conditions = { id: orm.gt(cursor), disabled: false };
  req.models.elections.find(conditions, { limit }, function(err, elections) {
    res.json({ err, elections });
  });
});

router.get('/:id', function(req, res) {
  const { id } = req.params;
  req.models.elections.one({ id, disabled: false }, function(err, election) {
    res.json({ err, election });
  });
});

module.exports = router;
