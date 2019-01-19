'use strict';

const async = require('async');

exports.up = function(db, callback) {
  async.series([
    db.addColumn.bind(db, 'elections', 'startTime', { type: 'bigint', notNull: true }),
    db.addColumn.bind(db, 'elections', 'endTime', { type: 'bigint', notNull: true }),
  ], callback);
};

exports.down = function(db, callback) {
  async.series([
    db.removeColumn.bind(db, 'elections', 'startTime'),
    db.removeColumn.bind(db, 'elections', 'endTime'),
  ], callback);
};

exports._meta = {
  version: 1,
};
