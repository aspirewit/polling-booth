'use strict';

exports.up = function(db) {
  return db.addIndex('ballots', 'index_ballots_on_user_id_and_candidate_id', [ 'userId', 'candidateId' ], true);
};

exports.down = function(db) {
  return db.removeIndex('ballots', 'index_ballots_on_user_id_and_candidate_id');
};

exports._meta = {
  version: 1,
};
