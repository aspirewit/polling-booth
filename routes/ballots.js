'use strict';

const express = require('express');
const orm = require('orm');
const { check } = require('express-validator/check');

const helper = require('../helper');
const { adminRequired, checkValidationResult } = require('../middlewares');

const router = express.Router();

const loadElection = function(req, res, next) {
  const { electionId } = req.params;

  req.models.elections.get(electionId, function(err, election) {
    if (election) {
      req.resources = req.resources || {};
      req.resources.election = election;

      next();
    } else {
      res.status(404).json({ message: 'resource not found' });
    }
  });
};

const checkElectionTimeRange = function(req, res, next) {
  const election = req.resources.election;
  const startTime = election.startTime;
  const endTime = election.endTime;
  const moment = Date.now();

  if (startTime > moment) {
    res.json({ code: 1101, message: "election haven't started yet" });
  } else if (endTime < moment) {
    res.json({ code: 1102, message: 'election has been ended' });
  } else {
    next();
  }
};

const middlewaresForSave = [
  check('candidateIds').isLength({ min: 1, max: 1024 }),
  check('candidateIds').matches(/^([0-9]+\,?)+$/),
  checkValidationResult(),
  loadElection,
  checkElectionTimeRange,
];

router.post('/:electionId/ballots', middlewaresForSave, function(req, res, next) {
  const election = req.resources.election;
  const candidateIds = req.body.candidateIds.split(',');

  const candidatesAttributes = candidateIds.map(function(candidateId) {
    return {
      userId: req.user.id,
      electionId: election.id,
      candidateId,
    };
  });

  req.models.ballots.create(candidatesAttributes, function(err) {
    if (err) {
      return next(err);
    }

    res.json({ code: 200, message: 'success' });
  });
});

router.get('/:electionId/ballots', [
  adminRequired(),
], function(req, res, next) {
  const electionId = req.params.electionId;
  const cursor = helper.parseInt(req.query.cursor);
  const limit = helper.pageSize(req.query.limit);

  const conditions = { electionId, id: orm.gt(cursor) };
  req.models.ballots.find(conditions, { limit }, [ 'id', 'Z' ], function(err, ballots) {
    if (err) {
      return next(err);
    }

    res.json({ code: 200, message: 'success', data: { ballots } });
  });
});

module.exports = router;
