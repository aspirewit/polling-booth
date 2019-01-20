'use strict';

module.exports = function(orm, db) {
  db.define('users', {
    fullname: { type: 'text', required: true },
    email: { type: 'text', required: true, unique: true },
    admin: { type: 'boolean', required: true },
    passwordDigest: { type: 'text', required: true },

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
      fullname: orm.enforce.ranges.length(1, 24),
      emal: orm.enforce.patterns.email(),
      passwordDigest: orm.enforce.patterns.match(/^\$2b\$\d+\$.{53}$/),
    },
    methods: {
      serialize() {
        return {
          id: this.id,
          fullname: this.fullname,
          email: this.email,
          admin: this.admin,
        };
      },
    },
  });
};
