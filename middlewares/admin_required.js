'use strict';

module.exports = function() {
  return function(req, res, next) {
    const loggedInUser = req.loggedInUser;

    if (loggedInUser && loggedInUser.admin) {
      next();
    } else {
      res.status(403).json({ message: 'forbidden' });
    }
  };
};
