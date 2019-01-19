'use strict';

exports.up = function(db) {
  return db.addColumn('elections', 'candidatesCount', { type: 'int', defaultValue: 0 });
};

exports.down = function(db) {
  return db.removeColumn('elections', 'candidatesCount');
};

exports._meta = {
  version: 1,
};
