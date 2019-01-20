'use strict';

const bcrypt = require('bcrypt');

exports.up = function(db, callback) {
  const saltRounds = 10;
  const passwordDigest = bcrypt.hashSync('abcd1234', saltRounds);
  const createdAt = Date.now();
  const updatedAt = createdAt;

  return db.insert(
    'users',
    [ 'fullname', 'email', 'admin', 'passwordDigest', 'createdAt', 'updatedAt' ],
    [ 'Admin', 'admin@example.com', 1, passwordDigest, createdAt, updatedAt ],
    callback
  );
};

exports.down = function(db) {
  return db.runSql('DELETE FROM users');
};

exports._meta = {
  version: 1,
};
