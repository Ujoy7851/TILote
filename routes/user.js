const express = require('express');
const { Op } = require("sequelize");
const { User, Post, Tag } = require('../models');
const { isLoggedIn } = require('./middlewares');
const logger = require('../config/logger');
const router = express.Router();

router.get('/temps', isLoggedIn, async (req, res, next) => {
  try {
    const user = await User.findOne({
      where: { 
        id: req.user.id
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
      res.set('Content-Security-Policy', 'unsafe-inline');
      res.render('userTemp', {
        owner: user,
        user: req.user,
        posts,
      });
    }
  } catch(error) {
    logger.error(error);
    next(error);
  }
});

router.get('/private', isLoggedIn, async (req, res, next) => {
  try {
    const user = await User.findOne({
      where: { id: req.user.id }
    });
    if(user) {
      let posts = await Post.findAll({
        where: {
          UserId: user.id,
          is_private: true
        },
        order: [['updated_at', 'DESC']]
      });
      res.set('Content-Security-Policy', 'unsafe-inline');
      res.render('userPrivate', {
        owner: user,
        user: req.user,
        posts
      });
    }
  } catch(error) {
    logger.error(error);
    next(error);
  }
});

router.get('/:username', async (req, res, next) => {
  try {
    const user = await User.findOne({
      where: { 
        username: req.params.username
      }
    });
    if(user) {
      let posts = await Post.findAll({
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
      let postLength = posts.length;
      let tags = await Promise.all(
        posts.map(async post => {
          let tagsTemp = await post.getTags();
          return Promise.all(tagsTemp.map(t => {
            let tag = t['dataValues']['name'];
            return tag;
          }));
      }));
      tags = tags.filter(t => !!t).reduce((a, c) => {
        c.map(tag => a[tag] = a[tag] ? a[tag] + 1 : 1);
        return a;
      }, {});
      if(req.query.tag) {
        const tag = await Tag.findOne({
          where: { name: req.query.tag }
        });
        posts = await tag.getPosts({
          where: {
            UserId: user.id,
            is_private: false,
            published_at: { [Op.ne]: null }
          },
          include: [{
            model: User,
            attributes: ['id', 'username']
          }],
          order: [['published_at', 'DESC']]
        });
      }
      res.set('Content-Security-Policy', 'unsafe-inline');
      res.render('user', {
        owner: user,
        user: req.user,
        posts,
        tags,
        tag: req.query.tag,
        postLength
      });
    }
  } catch(error) {
    logger.error(error);
    next(error);
  }
});

router.get('/:username/likes', async (req, res, next) => {
  try {
    const user = await User.findOne({
      where: { username: req.params.username }
    });
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
      res.set('Content-Security-Policy', 'unsafe-inline');
      res.render('userLike', {
        owner: user,
        user: req.user,
        posts
      });
    }
  } catch(error) {
    logger.error(error);
    next(error);
  }
});

module.exports = router;