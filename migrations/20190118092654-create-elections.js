'use strict';

exports.up = function(db) {
  return db.createTable('elections', {
    id: { type: 'bigint', primaryKey: true, autoIncrement: true },
    createdAt: 'bigint',
    updatedAt: 'bigint',

    title: { type: 'string', notNull: true },
    description: { type: 'text', notNull: true },
    enabled: { type: 'boolean', defaultValue: false },
    userId: { type: 'bigint', notNull: true },
  });
};

exports.down = function(db) {
  return db.dropTable('elections');
};

exports._meta = {
  version: 1,
};
