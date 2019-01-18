'use strict';

exports.up = function(db) {
  return db.createTable('candidates', {
    id: { type: 'bigint', primaryKey: true, autoIncrement: true },
    createdAt: 'bigint',
    updatedAt: 'bigint',

    fullname: { type: 'string', notNull: true },
    avatar: { type: 'string', notNull: true },
    introduction: { type: 'text', notNull: true },
    electionId: { type: 'bigint', notNull: true },
  });
};

exports.down = function(db) {
  return db.dropTable('candidates');
};

exports._meta = {
  version: 1,
};
