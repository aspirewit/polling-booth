'use strict';

const orm = require('orm');
const settings = require('../config/settings');

let connection = null;

function setup(db, callback) {
  require('./user')(orm, db);
  require('./election')(orm, db);
  require('./candidate')(orm, db);
  require('./ballot')(orm, db);

  return callback(null, db);
}

module.exports = function(callback) {
  if (connection) {
    return callback(null, connection);
  }

  orm.connect(settings.database, function(err, db) {
    if (err) {
      return callback(err);
    }

    connection = db;
    db.settings.set('instance.returnAllErrors', true);
    setup(db, callback);
  });
};
