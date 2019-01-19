'use strict';

const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { check, validationResult } = require('express-validator/check');
const settings = require('../config/settings');
const router = express.Router();

function generateJsonWebToken(user) {
  return jwt.sign({
    id: user.id,
  }, settings.jwt.secret, {
    expiresIn: settings.jwt.expiresIn,
  });
}

router.post('/register', [
  check('email').isEmail(),
  check('fullname').isLength({ min: 1, max: 24 }),
  check('password').matches(/^[a-zA-Z0-9]{6,24}$/),
  check('verificationCode').matches(/^[0-9]{4}$/),
], function(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  const { fullname, email, password, verificationCode } = req.body;
  console.log('verificationCode' + verificationCode);

  function createUser() {
    const saltRounds = 10;
    const passwordDigest = bcrypt.hashSync(password, saltRounds);
    req.models.users.create({ fullname, email, passwordDigest }, function(err, user) {
      if (err) {
        return next(err);
      }

      const token = generateJsonWebToken(user);
      res.json({ code: 200, message: 'success', data: { token } });
    });
  }

  req.models.users.one({ email }, function(err, user) {
    if (user) {
      res.json({ code: 1001, message: 'email address already in use' });
    } else {
      createUser();
    }
  });
});

router.post('/login', [
  check('email').isEmail(),
  check('password').matches(/^[a-zA-Z0-9]{6,24}$/),
], function(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  req.models.users.one({ email }, function(err, user) {
    if (!user) {
      return res.json({ code: 1001, message: 'user does not exist' });
    }

    const isMatch = bcrypt.compareSync(password, user.passwordDigest);
    if (!isMatch) {
      return res.json({ code: 1002, message: 'password is incorrect' });
    }

    const token = generateJsonWebToken(user);
    res.json({ code: 200, message: 'success', data: { token } });
  });
});

module.exports = router;
