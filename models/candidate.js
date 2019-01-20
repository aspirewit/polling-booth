'use strict';

const objects = require('lodash/object');

module.exports = function(orm, db) {
  db.define('candidates', {
    fullname: { type: 'text', required: true },
    avatar: { type: 'text', required: true },
    introduction: { type: 'text', required: true },
    ballotsCount: { type: 'integer', defaultValue: 0 },
    electionId: { type: 'integer', required: true },

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
    validations: {
      fullname: orm.enforce.ranges.length(1, 12),
      introduction: orm.enforce.ranges.length(10, 1024),
    },
    methods: {
      serialize(user) {
        if (user && user.admin) {
          return this;
        }
        return objects.omit(this, 'ballotsCount');
      },
    },
  });
};
