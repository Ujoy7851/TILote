const express = require('express');
const { Op } = require("sequelize");
const router = express.Router();
const { User, Post } = require('../models');
const { isLoggedIn } = require('./middlewares');

router.get('/', async (req, res, next) => {
  try {    
    const posts = await Post.findAll({
      where: {
        is_private: false,
        published_at: { [Op.ne]: null }
      },
      include: {
        model: User,
        attributes: ['id', 'username']
      },
      order: [['published_at', 'DESC']]
    });
    res.render('main', {
      posts,
      user: req.user
    });
  } catch(error) {
    console.error(error);
    next(error);
  }
});

router.get('/likes', async (req, res, next) => {
  try {
    const posts = await Post.findAll({
      where: {
        is_private: false,
        published_at: { [Op.ne]: null }
      },
      include: {
        model: User,
        attributes: ['id', 'username']
      },
      order: [['likes', 'DESC'], ['published_at', 'DESC']]
    });
    res.render('like', {
      posts,
      user: req.user
    });
  } catch(error) {
    console.error(error);
    next(error);
  }
})

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

router.get('/settings', isLoggedIn, (req, res, next) => {
  res.render('settings', {
    user: req.user
  })
});

router.post('/settings', isLoggedIn, async (req, res, next) => {
  try {
    await User.update({
      about: req.body.about,
      thumbnail: req.body.thumbnail
    }, {
      where: { id: req.user.id }
    });
    res.status(201).send({ username: req.user.username });
  } catch(error) {
    console.error(error);
    next(error);
  }
});

module.exports = router;