'use strict';

const settings = require('./config/settings');
const nodemailer = require('nodemailer');
const Queue = require('bull');
const emailQueue = new Queue('email', settings.redis.url);
const transporter = nodemailer.createTransport(settings.email.transporter);

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
  parseInt(number) {
    return parseInt(number) || 0;
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
