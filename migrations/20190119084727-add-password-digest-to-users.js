'use strict';

exports.up = function(db) {
  return db.addColumn('users', 'passwordDigest', { type: 'string', notNull: true });
};

exports.down = function(db) {
  return db.removeColumn('users', 'passwordDigest');
};

exports._meta = {
  version: 1,
};
