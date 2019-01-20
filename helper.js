'use strict';

const nodemailer = require('nodemailer');
const Queue = require('bull');
const redis = require('redis');
const settings = require('./config/settings');

const redisUrl = settings.redis.url;
const emailQueue = new Queue('email', redisUrl);
const transporter = nodemailer.createTransport(settings.email.transporter);
const redisClient = redis.createClient({ url: redisUrl });

emailQueue.process(function(job, done) {
  const { to, subject, text } = job.data;
  const mailOptions = { to, subject, text, from: settings.email.defaultFrom };

  transporter.sendMail(mailOptions, function(err, info) {
    if (err) {
      done(err);
    } else {
      done(null, info);
    }
  });
});

module.exports = {
  redisClient,

  parseInt(number) {
    return parseInt(number) || 0;
  },

  parseBoolean(bool) {
    return bool === true || bool === 'true' || bool === 'True';
  },

  pageSize(number) {
    const maxPageSize = settings.view.maxPageSize;
    const size = parseInt(number) || maxPageSize;
    return Math.min(size, maxPageSize);
  },

  sendEmail(to, subject, text) {
    emailQueue.add({ to, subject, text });
  },
};
