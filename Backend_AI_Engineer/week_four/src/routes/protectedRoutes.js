const express = require('express');
const { AppError } = require('../errors');

function extractBearerToken(authorizationHeader) {
  if (typeof authorizationHeader !== 'string') {
    throw new AppError(401, 'Access token required');
  }

  const [scheme, token, extra] = authorizationHeader.trim().split(/\s+/);

  if (scheme !== 'Bearer' || !token || extra) {
    throw new AppError(401, 'Access token required');
  }

  return token;
}

function createProtectedRouter(authMiddleware) {
  const router = express.Router();

  router.get('/protected/profile', authMiddleware, (req, res) => {
    res.json({
      user: req.user
    });
  });

  router.get('/protected/dashboard', authMiddleware, (req, res) => {
    res.json({
      message: 'Welcome to your protected dashboard.',
      user: req.user
    });
  });

  return router;
}

module.exports = {
  createProtectedRouter,
  extractBearerToken
};
