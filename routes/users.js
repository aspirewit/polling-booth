'use strict';

const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { check, validationResult } = require('express-validator/check');

const settings = require('../config/settings');
const helper = require('../helper');
const services = require('../services');

const router = express.Router();

function generateJsonWebToken(user) {
  return jwt.sign({
    id: user.id,
  }, settings.jwt.secret, {
    expiresIn: settings.jwt.expiresIn,
  });
}

router.post('/verification-code', [
  check('email').isEmail(),
], function(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  const email = req.body.email;
  services.verificationCode.allowGenerate(email).then(function(allowed) {
    if (!allowed) {
      return res.json({ code: 1001, message: 'too frequent requests' });
    }

    const code = services.verificationCode.generate(email);
    helper.sendEmail(
      email,
      '[Polling Booth] Verification Code',
      `Your verification code is ${code}, its effective time is 5 minutes.`
    );

    res.json({ code: 200, message: 'success' });
  });
});

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

  function createUser() {
    const saltRounds = 10;
    const passwordDigest = bcrypt.hashSync(password, saltRounds);
    req.models.users.create({ fullname, email, passwordDigest }, function(err, user) {
      if (err) {
        return next(err);
      }

      const token = generateJsonWebToken(user);
      res.json({ code: 200, message: 'success', data: { user: user.serialize(), token } });
    });
  }

  services.verificationCode.isMatch(email, verificationCode).then(function(matched) {
    if (!matched) {
      return res.json({ code: 1001, message: 'verification code is incorrect' });
    }

    req.models.users.one({ email }, function(err, user) {
      if (user) {
        res.json({ code: 1002, message: 'email address already in use' });
      } else {
        createUser();
      }
    });
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
    res.json({ code: 200, message: 'success', data: { user: user.serialize(), token } });
  });
});

module.exports = router;
