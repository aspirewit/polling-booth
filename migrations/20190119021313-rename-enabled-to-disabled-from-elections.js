'use strict';

exports.up = function(db) {
  return db.renameColumn('elections', 'enabled', 'disabled');
};

exports.down = function(db) {
  return db.renameColumn('elections', 'disabled', 'enabled');
};

exports._meta = {
  version: 1,
};
