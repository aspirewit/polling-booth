'use strict';

exports.up = function(db) {
  return db.createTable('users', {
    id: { type: 'bigint', primaryKey: true, autoIncrement: true },
    createdAt: 'bigint',
    updatedAt: 'bigint',

    fullname: { type: 'string', notNull: true },
    email: { type: 'string', notNull: true, unique: true },
    admin: { type: 'boolean', notNull: true, defaultValue: false },
  });
};

exports.down = function(db) {
  return db.dropTable('users');
};

exports._meta = {
  version: 1,
};
