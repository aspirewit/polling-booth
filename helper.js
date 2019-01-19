'use strict';

const settings = require('./config/settings');

module.exports = {
  parseInt(number) {
    return parseInt(number) || 0;
  },

  pageSize(number) {
    const maxPageSize = settings.view.maxPageSize;
    const size = parseInt(number) || maxPageSize;
    return Math.min(size, maxPageSize);
  },
};
