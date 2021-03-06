const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const marked = require('marked');
const removeMd = require('remove-markdown');
const { Op } = require("sequelize");
const { isLoggedIn } = require('./middlewares');
const { Post, User, Tag, sequelize, Comment } = require('../models');
const { convertToTrees } = require('../public/js/util');
const logger = require('../config/logger');
const router = express.Router();


fs.readdir('uploads', (error) => {
  if (error) {
    logger.error('uploads 폴더가 없어 uploads 폴더를 생성합니다.');
    fs.mkdirSync('uploads');
  }
});

const upload = multer({
  storage: multer.diskStorage({
      destination(req, file, cb) {
          cb(null, 'uploads/');
      },
      filename(req, file, cb) {
          const ext = path.extname(file.originalname);
          cb(null, path.basename(file.originalname, ext) + new Date().valueOf() + ext);
      }
  }),
  limit: { fileSize: 5 * 1024 * 1024},
});

router.get('/', isLoggedIn, async (req, res, next) => {;
  if(req.query.id) {
    const post = await Post.findOne({
      where: { id: req.query.id }
    });
    let tags = await post.getTags();
    tags = tags.map(t => '#' + t.name);
    res.render('newPost', {
      user: req.user,
      post: JSON.stringify(post),
      tags
    });
  } else {
    res.render('newPost', {
      user: req.user
    });
  }
});

router.post('/', isLoggedIn, async (req, res, next) => {
  try {
    let post;
    if(req.body.id) {
      post = await Post.findOne({
        where: { id: req.body.id }
      });
    }    
    let description = null;
    if(!req.body.description) {
      description = removeMd(req.body.content).substring(0, 100);
    } else {
      description = req.body.description;
    }
    if(post) {
        if(post.published_at) {
            await Post.update({
                title: req.body.title,
                content: req.body.content,
                is_private: req.body.is_private,
                UserId: req.user.id,
                thumbnail: req.body.thumbnail,
                description,
                updated_at: sequelize.literal('CURRENT_TIMESTAMP')
            }, {
            where: { id: req.body.id }
            });
        } else {
            await Post.update({
                title: req.body.title,
                content: req.body.content,
                is_private: req.body.is_private,
                UserId: req.user.id,
                thumbnail: req.body.thumbnail,
                description,
                updated_at: sequelize.literal('CURRENT_TIMESTAMP'),
                published_at: sequelize.literal('CURRENT_TIMESTAMP')
            }, {
            where: { id: req.body.id }
            });
        }
    } else {
      post = await Post.create({
        title: req.body.title,
        content: req.body.content,
        is_private: req.body.is_private,
        UserId: req.user.id,
        thumbnail: req.body.thumbnail,
        description,
        published_at: sequelize.literal('CURRENT_TIMESTAMP')
      });
    }
    const tags = req.body.tag.match(/#[^\s#]*/g);
    if(tags) {
      const result = await Promise.all(tags.map(tag => {
        return Tag.findOrCreate({
            where: { name: tag.slice(1).toLowerCase() },
        })
      }));
      await post.setTags(result.map(r => r[0]));
    }
    res.status(201).send({ username: req.user.username });
  } catch(error) {
    logger.error(error);
    next(error);
  }
});

router.post('/temp', isLoggedIn, async (req, res, next) => {
  try {
    let post;
    if(req.body.id) {
      post = await Post.findOne({
        where: { id: req.body.id }
      });
    }
    let description = null;
    if(!req.body.description) {
      description = removeMd(req.body.content).substring(0, 100);
    } else {
      description = req.body.description;
    }
    if(post) {
      await Post.update({
        title: req.body.title,
        content: req.body.content,
        is_private: req.body.is_private,
        UserId: req.user.id,
        thumbnail: req.body.thumbnail,
        description,
        published_at: null
      }, {
        where: { id: req.body.id }
      });
    } else {
      post = await Post.create({
        title: req.body.title,
        content: req.body.content,
        is_private: req.body.is_private,
        UserId: req.user.id,
        thumbnail: req.body.thumbnail,
        description,
        published_at: null
      });
    }
    const tags = req.body.tag.match(/#[^\s#]*/g);
    if(tags) {
      const result = await Promise.all(tags.map(tag => {
        return Tag.findOrCreate({
            where: { name: tag.slice(1).toLowerCase() },
        })
      }));
      await post.setTags(result.map(r => r[0]));
    }
    res.json(post.id);
  } catch(error) {
    logger.error(error);
    next(error);
  }
});

router.post('/img', isLoggedIn, upload.single('img'), (req, res) => {
  res.json({ url: `/img/${req.file.filename }` });
});

router.get('/:postId', async (req, res, next) => {
  try {
    const post = await Post.findOne({
      where: {
        id: req.params.postId
      },
      include: [{
        model: User,
        attributes: ['id', 'username']
      }, {
        model: User,
        attributes: ['id', 'username'],
        as: 'Liker'
      }]
    });

    const nextId = await Post.min('id', {
      where: {
        user_id: post.UserId,
        published_at: { [Op.ne]: null },
        id: {
          [Op.gt]: post.id
        }
      }
    });
    const prevId = await Post.max('id', {
      where: {
        user_id: post.UserId,
        published_at: { [Op.ne]: null },
        id: {
          [Op.lt]: post.id
        }
      }
    });
    let prevPost, nextPost;
    if(prevId) {
      prevPost = await Post.findOne({
        where: { id: prevId }
      });
    }
    if(nextId) {
      nextPost = await Post.findOne({
        where: { id: nextId }
      });
    }

    let tags = await post.getTags();
    tags = tags.map(t => t['dataValues']);

    const comments = await Comment.findAll({
      where: { 
        PostId: post.id,
        is_deleted: false
      },
      include: [{
        model: User,
        attributes: [ 'id', 'username' ]
      }],
      order: [['created_at', 'DESC']]
    });

    const [commentsTree, numOfChild] = convertToTrees(comments, 'id', 'parent_comment', 'childComments');

    if(post) {
      marked.setOptions({
        headerIds: false,
        langPrefix: ''
      });
      const content = marked(post.content);
      res.render('post', {
        post,
        user: req.user,
        content,
        tags,
        prev: prevPost,
        next: nextPost,
        commentLength: commentsTree.length + numOfChild,
        commentsTree
      });
    }
  } catch(error) {
    logger.error(error);
    next(error);
  }
});

router.post('/:postId/like', isLoggedIn, async (req, res, next) => {
  try {
    const post = await Post.findOne({
      where: { id: req.params.postId }
    });
    const test = await Post.update({
      likes: post.likes + 1
    }, {
      where: { id: req.params.postId }
    });
    await post.addLiker(req.user.id);
    res.status(200).send();
  } catch(error) {
    logger.error(error);
    next(error);
  }
});

router.post('/:postId/unlike', isLoggedIn, async (req, res, next) => {
  try {
    const post = await Post.findOne({
      where: { id: req.params.postId }
    });
    const test = await Post.update({
      likes: post.likes - 1
    }, {
      where: { id: req.params.postId }
    });
    await post.removeLiker(req.user.id);
    res.status(200).send();
  } catch(error) {
    logger.error(error);
    next(error);
  }
});

router.delete('/:postId', async (req, res, next) => {
  try {
    await Post.destroy({
      where: {
        id: req.params.postId, user_id: req.user.id
      }
    });
    res.send('OK');
  } catch(error) {
    logger.error(error);
    next(error);
  }
})

module.exports = router;