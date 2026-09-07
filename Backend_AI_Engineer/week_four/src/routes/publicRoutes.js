const express = require('express');

function createPublicRouter() {
  const router = express.Router();

  router.get('/public/info', (req, res) => {
    res.json({
      message: 'Welcome stranger! This info is public.'
    });
  });

  return router;
}

module.exports = {
  createPublicRouter
};
