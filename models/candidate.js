'use strict';

module.exports = function(orm, db) {
  db.define('candidates', {
    fullname: { type: 'text', required: true },
    avatar: { type: 'text', required: true },
    introduction: { type: 'text', required: true },
    ballotsCount: { type: 'integer', defaultValue: 0 },

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
      function: orm.enforce.ranges.length(1, 12),
      introduction: orm.enforce.ranges.length(10, 1024),
    },
  });
};
