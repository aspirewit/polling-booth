'use strict';

module.exports = function(orm, db) {
  db.define('users', {
    fullname: { type: 'text', required: true },
    email: { type: 'text', required: true, unique: true },
    admin: { type: 'boolean', required: true },

    createdAt: { type: 'date', required: true, time: true },
    updatedAt: { type: 'date', required: true, time: true },
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
      fullname: orm.enforce.ranges.length(1, 24),
    },
  });
};
