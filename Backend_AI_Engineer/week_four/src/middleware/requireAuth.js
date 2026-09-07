const { AppError } = require('../errors');
const { extractBearerToken } = require('../routes/protectedRoutes');

function formatUser(user) {
  return {
    id: user.id,
    email: user.email,
    created_at: user.created_at
  };
}

function requireAuth(supabase) {
  return async function authMiddleware(req, res, next) {
    try {
      const token = extractBearerToken(req.headers.authorization);
      const { data, error } = await supabase.auth.getUser(token);

      if (error || !data.user) {
        throw new AppError(401, 'Invalid or expired token');
      }

      req.accessToken = token;
      req.user = formatUser(data.user);
      next();
    } catch (error) {
      next(error);
    }
  };
}

module.exports = {
  requireAuth,
  formatUser
};
