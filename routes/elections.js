'use strict';

const express = require('express');
const objects = require('lodash/object');
const orm = require('orm');
const { check } = require('express-validator/check');

const helper = require('../helper');
const { adminRequired, checkValidationResult } = require('../middlewares');

const router = express.Router();

const middlewaresForSave = [
  adminRequired(),
  check('title').isLength({ min: 5, max: 30 }),
  check('description').isLength({ min: 10, max: 1024 }),
  check('startTime').isInt(),
  check('endTime').isInt(),
  check('disabled').isBoolean(),
  checkValidationResult(),
];

router.post('/', middlewaresForSave, function(req, res, next) {
  const attrs = objects.pick(req.body, [ 'title', 'description', 'startTime', 'endTime' ]);
  attrs.userId = req.user.id;
  attrs.disabled = helper.parseBoolean(req.body.disabled);

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

  const conditions = { id: orm.gt(cursor) };
  req.models.elections.find(conditions, { limit }, [ 'id', 'Z' ], function(err, elections) {
    if (err) {
      return next(err);
    }

    res.json({ code: 200, message: 'success', data: { elections } });
  });
});

router.get('/:id', function(req, res, next) {
  const { id } = req.params;
  req.models.elections.get(id, function(err, election) {
    if (err) {
      return next(err);
    }

    if (!election) {
      return res.status(404).json({ message: 'resource not found' });
    }

    res.json({ code: 200, message: 'success', data: { election } });
  });
});

router.patch('/:id', middlewaresForSave, function(req, res, next) {
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
    election.disabled = helper.parseBoolean(disabled);

    election.save(function(err) {
      if (err) {
        return next(err);
      }

      res.json({ code: 200, message: 'success', data: { election } });
    });
  });
});

module.exports = router;
