'use strict';

exports.up = function(db) {
  return db.createTable('ballots', {
    id: { type: 'bigint', primaryKey: true, autoIncrement: true },
    createdAt: 'bigint',
    updatedAt: 'bigint',

    userId: { type: 'bigint', notNull: true },
    electionId: { type: 'bigint', notNull: true },
    candidateId: { type: 'bigint', notNull: true },
  });
};

exports.down = function(db) {
  return db.dropTable('ballots');
};

exports._meta = {
  version: 1,
};
