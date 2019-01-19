'use strict';

exports.up = function(db) {
  return db.addColumn('elections', 'userId', { type: 'bigint', notNull: true });
};

exports.down = function(db) {
  return db.removeColumn('elections', 'userId');
};

exports._meta = {
  version: 1,
};
