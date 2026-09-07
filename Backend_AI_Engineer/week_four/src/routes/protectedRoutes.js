const express = require('express');
const { AppError } = require('../errors');

function asyncHandler(handler) {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}

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

function formatProfile(user) {
  return {
    id: user.id,
    email: user.email,
    created_at: user.created_at
  };
}

function createProtectedRouter(supabase) {
  const router = express.Router();

  router.get(
    '/protected/profile',
    asyncHandler(async (req, res) => {
      const token = extractBearerToken(req.headers.authorization);
      const { data, error } = await supabase.auth.getUser(token);

      if (error || !data.user) {
        throw new AppError(401, 'Invalid or expired token');
      }

      res.json({
        user: formatProfile(data.user)
      });
    })
  );

  return router;
}

module.exports = {
  createProtectedRouter,
  extractBearerToken,
  formatProfile
};
