'use strict';

exports.up = function(db) {
  return db.addColumn('candidates', 'ballotsCount', { type: 'int', notNull: true, defaultValue: 0 });
};

exports.down = function(db) {
  return db.removeColumn('candidates', 'ballotsCount');
};

exports._meta = {
  version: 1,
};
