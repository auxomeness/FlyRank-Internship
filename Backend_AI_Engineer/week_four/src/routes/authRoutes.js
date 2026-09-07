const express = require('express');
const { AppError } = require('../errors');

function asyncHandler(handler) {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}

function validateCredentials(body) {
  const email = typeof body.email === 'string' ? body.email.trim() : '';
  const password = typeof body.password === 'string' ? body.password : '';

  if (!email || !password) {
    throw new AppError(400, 'Email and password are required');
  }

  return {
    email,
    password
  };
}

function createAuthRouter(supabase, authMiddleware) {
  const router = express.Router();

  router.post(
    '/auth/signup',
    asyncHandler(async (req, res) => {
      const { email, password } = validateCredentials(req.body);
      const { data, error } = await supabase.auth.signUp({ email, password });

      if (error) {
        throw new AppError(400, error.message);
      }

      res.status(201).json({
        user: data.user
      });
    })
  );

  router.post(
    '/auth/login',
    asyncHandler(async (req, res) => {
      const { email, password } = validateCredentials(req.body);
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error || !data.session) {
        throw new AppError(401, 'Invalid login credentials');
      }

      res.json({
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        token_type: data.session.token_type,
        expires_in: data.session.expires_in,
        user: data.user
      });
    })
  );

  router.post('/auth/logout', authMiddleware, async (req, res, next) => {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        return next(new AppError(401, 'Invalid or expired token'));
      }

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  });

  return router;
}

module.exports = {
  createAuthRouter,
  validateCredentials
};
