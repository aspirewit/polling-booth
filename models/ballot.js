'use strict';

module.exports = function(orm, db) {
  db.define('ballots', {
    userId: { type: 'integer', required: true },
    electionId: { type: 'integer', required: true },
    candidateId: { type: 'integer', required: true },

    createdAt: { type: 'date', time: true },
    updatedAt: { type: 'date', time: true },
  }, {
    hooks: {
      beforeCreate() {
        this.createdAt = Date.now();
      },
      beforeSave() {
        this.updatedAt = Date.now();
      },
    },
  });
};
