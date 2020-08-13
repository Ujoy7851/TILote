const express = require('express');
const { Op } = require("sequelize");
const { User, Post } = require('../models');
const { isLoggedIn } = require('./middlewares');
const router = express.Router();

router.get('/:username', async (req, res, next) => {
  try {
    const user = await User.findOne({
      where: { 
        username: req.params.username
      }
    });
    if(user) {
      const posts = await Post.findAll({
        where: {
          UserId: user.id,
          is_private: false,
          published_at: { [Op.ne]: null }
        },
        include: {
          model: User,
          attributes: ['id', 'username']
        },
        order: [['published_at', 'DESC']]
      });
      let tags = await Promise.all(posts.map(async post => {
        let tagsTemp = await post.getTags();
        return Promise.all(tagsTemp.map(t => {
          let tag = t['dataValues']['name'];
          return tag;
        }))
      }));
      tags = tags.filter(t => !!t).reduce((a, c) => {
        c.map(tag => a[tag] = a[tag] ? a[tag] + 1 : 1);
        return a;
      }, {});
      // let tags = { test: 3, node: 1, '태그': 1, redis: 1, express: 1, nodejs: 71, sequelize: 1, user: 5, abcdef: 1, text: 3, verylongtagname: 81, moretag:77 };
      console.log(tags);
      res.render('user', {
        owner: user,
        user: req.user,
        posts,
        tags
      });
    }
  } catch(error) {
    console.error(error);
    next(error);
  }
});

router.get('/:username/likes', async (req, res, next) => {
  try {
    const user = await User.findOne({
      where: { username: req.params.username }
    });
    // let posts = [];
    if(user) {
      let posts = await user.getLiked({
        where: {
          is_private: false,
          published_at: { [Op.ne]: null }
        },
        include: [{
          model: User,
          attributes: ['id', 'username']
        }],
        order: [['published_at', 'DESC']]
      });
      res.render('userLike', {
        owner: user,
        user: req.user,
        posts
      });
    }
  } catch(error) {
    console.error(error);
    next(error);
  }
});

router.get('/:username/temps', isLoggedIn, async (req, res, next) => {
  try {
    const user = await User.findOne({
      where: { 
        username: req.params.username
      }
    });
    if(user) {
      const posts = await Post.findAll({
        where: {
          UserId: user.id,
          published_at: null
        },
        order: [['updated_at', 'DESC']]
      });
      res.render('userTemp', {
        owner: user,
        user: req.user,
        posts,
      });
    }
  } catch(error) {
    console.error(error);
    next(error);
  }
});

module.exports = router;