'use strict';

const express = require('express');
const objects = require('lodash/object');
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

const checkElectionStartTime = function(req, res, next) {
  const startTime = req.resources.election.startTime;
  if (startTime < Date.now()) {
    next();
  } else {
    res.json({ code: 1101, message: 'election has been started' });
  }
};

const middlewaresForSave = [
  adminRequired(),
  check('fullname').isLength({ min: 1, max: 12 }),
  check('avatar'),
  check('introduction').isLength({ min: 10, max: 1024 }),
  checkValidationResult(),
  loadElection,
  checkElectionStartTime,
];

const middlewaresForDestroy = [
  adminRequired(),
  loadElection,
  checkElectionStartTime,
];

router.post('/:electionId/candidates', middlewaresForSave, function(req, res, next) {
  const attrs = objects.pick(req.body, [ 'fullname', 'avatar', 'introduction' ]);
  const election = req.resources.election;
  attrs.electionId = election.id;

  req.models.candidates.create(attrs, function(err, candidate) {
    if (err) {
      return next(err);
    }

    election.candidatesCount += 1;
    election.save();

    res.json({ code: 200, message: 'success', data: { candidate } });
  });
});

router.get('/:electionId/candidates', function(req, res, next) {
  const electionId = req.params.electionId;
  const cursor = helper.parseInt(req.query.cursor);
  const limit = helper.pageSize(req.query.limit);

  const conditions = { electionId, id: orm.gt(cursor) };
  req.models.candidates.find(conditions, { limit }, [ 'id', 'Z' ], function(err, candidates) {
    if (err) {
      return next(err);
    }

    res.json({ code: 200, message: 'success', data: { candidates } });
  });
});

router.get('/:electionId/candidates/:id', function(req, res, next) {
  const { electionId, id } = req.params;
  req.models.candidates.one({ id, electionId }, function(err, candidate) {
    if (err) {
      return next(err);
    }

    if (!candidate) {
      return res.status(404).json({ message: 'resource not found' });
    }

    res.json({ code: 200, message: 'success', data: { candidate } });
  });
});

router.patch('/:electionId/candidates/:id', middlewaresForSave, function(req, res, next) {
  const { electionId, id } = req.params;
  const { fullname, avatar, introduction } = req.body;

  req.models.candidates.one({ electionId, id }, function(err, candidate) {
    if (err) {
      return next(err);
    }

    candidate.fullname = fullname;
    candidate.avatar = avatar;
    candidate.introduction = introduction;

    candidate.save(function(err) {
      if (err) {
        return next(err);
      }

      res.json({ code: 200, message: 'success', data: { candidate } });
    });
  });
});

router.delete('/:electionId/candidates/:id', middlewaresForDestroy, function(req, res, next) {
  const { electionId, id } = req.params;

  req.models.candidates.one({ electionId, id }, function(err, candidate) {
    if (err) {
      return next(err);
    }

    candidate.remove(function(err) {
      if (!err) {
        const election = req.resources.election;
        election.candidatesCount -= 1;
        election.save();
      }
    });

    res.json({ code: 200, message: 'success' });
  });
});

module.exports = router;
