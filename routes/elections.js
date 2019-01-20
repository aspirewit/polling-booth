'use strict';

const express = require('express');
const objects = require('lodash/object');
const { check, validationResult } = require('express-validator/check');
const helper = require('../helper');

const router = express.Router();
const orm = require('orm');

router.post('/', [
  check('title').isLength({ min: 5, max: 30 }),
  check('description').isLength({ min: 10, max: 1024 }),
  check('startTime').isInt(),
  check('endTime').isInt(),
  check('disabled').isBoolean(),
], function(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  const attrs = objects.pick(req.body, [ 'title', 'description', 'startTime', 'endTime', 'disabled' ]);
  attrs.userId = req.user.id;

  req.models.elections.create(attrs, function(err, election) {
    if (err) {
      return next(err);
    }

    res.json({ code: 200, message: 'success', data: { election } });
  });
});

router.get('/', function(req, res, next) {
  const cursor = helper.parseInt(req.query.cursor);
  const limit = helper.pageSize(req.query.limit);

  const conditions = { id: orm.gt(cursor), disabled: false };
  req.models.elections.find(conditions, { limit }, [ 'id', 'Z' ], function(err, elections) {
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

router.patch('/:id', [
  check('title').isLength({ min: 5, max: 30 }),
  check('description').isLength({ min: 10, max: 1024 }),
  check('startTime').isInt(),
  check('endTime').isInt(),
  check('disabled').isBoolean(),
], function(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  const electionId = req.params.id;
  const { title, description, startTime, endTime, disabled } = req.body;

  req.models.elections.get(electionId, function(err, election) {
    if (err) {
      return next(err);
    }

    election.title = title;
    election.description = description;
    election.startTime = startTime;
    election.endTime = endTime;
    election.disabled = disabled;

    election.save(function(err) {
      if (err) {
        return next(err);
      }

      res.json({ code: 200, message: 'success', data: { election } });
    });
  });
});

module.exports = router;
