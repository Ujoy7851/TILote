const express = require('express');
const router = express.Router();
const { User, Post } = require('../models');

router.get('/', async (req, res, next) => {
  try {
    const posts = await Post.findAll({
      include: {
        model: User,
        attributes: ['id', 'username']
      },
      order: [['createdAt', 'DESC']]
    });
    res.render('main', {
      posts,
      user: req.user
    })
  } catch(error) {
    console.error(error);
    next(error);
  }
});

router.get('/login', (req, res, next) => {
  res.render('login', {
    loginError: req.flash('loginError')
  });
});

router.get('/join', (req, res, next) => {
  res.render('join', {
    joinError: req.flash('joinError')
  });
});

module.exports = router;