'use strict';

module.exports = function(orm, db) {
  db.define('elections', {
    title: { type: 'text', required: true },
    description: { type: 'text', required: true },
    candidatesCount: { type: 'integer' },
    disabled: { type: 'boolean' },
    startTime: { type: 'date', required: true, time: true },
    endTime: { type: 'date', required: true, time: true },
    createdAt: { type: 'date', required: true, time: true },
    updatedAt: { type: 'date', required: true, time: true },
  }, {
    validations: {
      title: orm.enforce.ranges.length(5, 30),
      description: orm.enforce.ranges.length(10, 1024),
    },
  });
};
