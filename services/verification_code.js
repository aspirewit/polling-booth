'use strict';

const { promisify } = require('util');
const { redisClient } = require('../helper');
const getAsync = promisify(redisClient.get).bind(redisClient);

function renderKey(email) {
  return `verification-code:${email}`;
}

function parseResult(email) {
  return getAsync(renderKey(email)).then(function(serialized) {
    if (!serialized) {
      return {};
    }
    return JSON.parse(serialized);
  });
}

module.exports = {
  generate(email) {
    const code = Math.floor(Math.random() * 9000) + 1000;
    const serialized = JSON.stringify({ code: code.toString(), timestamp: Date.now() });
    const maxAge = 5 * 60; // 5 minutes
    redisClient.set(renderKey(email), serialized, 'EX', maxAge);

    return code;
  },

  allowGenerate(email) {
    return parseResult(email).then(function(result) {
      const interval = 60 * 1000; // 60 seconds
      const { code, timestamp } = result;

      return !code || !timestamp || (timestamp + interval) < Date.now();
    });
  },

  isMatch(email, codeAttempt) {
    return parseResult(email).then(function(result) {
      const code = result.code;

      if (code) {
        redisClient.del(renderKey(email));
        return code === codeAttempt;
      }

      return false;
    });
  },
};
