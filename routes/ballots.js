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
  const disabled = election.disabled;
  const startTime = election.startTime;
  const endTime = election.endTime;
  const moment = Date.now();

  if (disabled) {
    res.json({ code: 1101, message: 'election is disabled' });
  } else if (startTime > moment) {
    res.json({ code: 1102, message: "election haven't started yet" });
  } else if (endTime < moment) {
    res.json({ code: 1103, message: 'election has been ended' });
  } else {
    next();
  }
};

const preventMultipleVoting = function(req, res, next) {
  const election = req.resources.election;

  req.models.ballots.exists({ electionId: election.id, userId: req.user.id }, function(err, voted) {
    if (voted) {
      res.json({ code: 1104, message: 'already voted' });
    } else {
      next();
    }
  });
};

const middlewaresForSave = [
  check('candidateIds').isLength({ min: 1, max: 2048 }),
  check('candidateIds').matches(/^([0-9]+\,?)+$/),
  checkValidationResult(),
  loadElection,
  checkElectionTimeRange,
  preventMultipleVoting,
];

router.post('/:electionId/ballots', middlewaresForSave, function(req, res, next) {
  const election = req.resources.election;
  const candidateIds = req.body.candidateIds.split(',');
  const maxBallots = election.candidatesCount * 0.2;
  const minBallots = 2;

  if (candidateIds.length === 0) {
    return res.json({ code: 1001, message: 'at least one ballot' });
  } else if (candidateIds.length > minBallots && candidateIds.length >= maxBallots) {
    return res.json({ code: 1002, message: 'exceed maximum ballots' });
  }

  function createBallots() {
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

      const rawQuery = `UPDATE candidates SET ballotsCount=ballotsCount+1 WHERE id IN (${candidateIds})`;
      req.db.driver.execQuery(rawQuery, function(err) {
        if (err) {
          next(err);
        } else {
          res.json({ code: 200, message: 'success' });
        }
      });
    });
  }

  req.models.candidates.count({ electionId: election.id, id: candidateIds }, function(err, count) {
    if (count === candidateIds.length) {
      createBallots();
    } else {
      res.json({ code: 1003, message: 'contains nonexistent candidate ids' });
    }
  });
});

router.get('/:electionId/ballots', [
  adminRequired(),
], function(req, res, next) {
  const electionId = req.params.electionId;
  const cursor = helper.parseInt(req.query.cursor);
  const limit = helper.pageSize(req.query.limit);

  const conditions = cursor ? { electionId, id: orm.lt(cursor) } : {};
  req.models.ballots.find(conditions, { limit }, [ 'id', 'Z' ], function(err, ballots) {
    if (err) {
      return next(err);
    }

    res.json({ code: 200, message: 'success', data: { ballots } });
  });
});

module.exports = router;
