const express = require('express');
const { isLoggedIn } = require('./middlewares');
const router = express.Router();

router.get('/', isLoggedIn, (req, res, next) => {
  res.render('newPost', {
    user: req.user
  });
})

module.exports = router;