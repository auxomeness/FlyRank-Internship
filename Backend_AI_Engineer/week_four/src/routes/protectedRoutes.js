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

function createProtectedRouter() {
  const router = express.Router();

  router.get('/protected/profile', (req, res) => {
    const token = extractBearerToken(req.headers.authorization);

    res.json({
      message: 'Protected profile route reached',
      tokenPreview: `${token.slice(0, 8)}...`
    });
  });

  return router;
}

module.exports = {
  createProtectedRouter,
  extractBearerToken
};
