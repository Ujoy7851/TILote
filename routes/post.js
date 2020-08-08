const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { isLoggedIn } = require('./middlewares');
const { Post, User, Tag, sequelize } = require('../models');
const router = express.Router();

fs.readdir('uploads', (error) => {
  if (error) {
    console.error('uploads 폴더가 없어 uploads 폴더를 생성합니다.');
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

router.get('/', isLoggedIn, (req, res, next) => {
  // console.log('/post');
  res.render('newPost', {
    user: req.user
  });
});

router.post('/', isLoggedIn, async (req, res, next) => {
  try {
    let post = await Post.findOne({
      where: { title: req.body.title }
    });
    if(post) {
      await Post.update({
        content: req.body.content,
        is_private: req.body.is_private,
        UserId: req.user.id,
        thumbnail: req.body.thumbnail,
        description: req.body.description,
        published_at: sequelize.literal('CURRENT_TIMESTAMP')
      }, {
        where: { title: req.body.title }
      });
      // console.log('update post:', post)
    } else {
      post = await Post.create({
        title: req.body.title,
        content: req.body.content,
        is_private: req.body.is_private,
        UserId: req.user.id,
        thumbnail: req.body.thumbnail,
        description: req.body.description,
        published_at: sequelize.literal('CURRENT_TIMESTAMP')
      });
    }
    const tags = req.body.tag.match(/#[^\s#]*/g);
    // console.log('tags:', tags);
    if(tags) {
      const result = await Promise.all(tags.map(tag => {
        return Tag.findOrCreate({
            where: { name: tag.slice(1).toLowerCase() },
        })
      }));
      await post.addTags(result.map(r => r[0]));
    }
    // console.log('user_id:', req.user.id);
    res.status(201).send();
  } catch(error) {
    console.error(error);
    next(error);
  }
});

router.post('/temp', isLoggedIn, async (req, res, next) => {
  try {
    let post = await Post.findOne({
      where: { title: req.body.title }
    });
    if(post) {
      await Post.update({
        content: req.body.content,
        is_private: req.body.is_private,
        UserId: req.user.id,
        published_at: null
      }, {
        where: { title: req.body.title }
      });
      // console.log('update post:', post)
    } else {
      post = await Post.create({
        title: req.body.title,
        content: req.body.content,
        is_private: req.body.is_private,
        UserId: req.user.id,
      });
    }
    const tags = req.body.tag.match(/#[^\s#]*/g);
    // console.log('tags:', tags);
    if(tags) {
      const result = await Promise.all(tags.map(tag => {
        return Tag.findOrCreate({
            where: { name: tag.slice(1).toLowerCase() },
        })
      }));
      // await post.addTags(result.map(r => r[0]));
    }
    console.log(req.body);
    res.sendStatus(200);
  } catch(error) {
    console.error(error);
    next(error);
  }
});

router.post('/img', isLoggedIn, upload.single('img'), (req, res) => {
  console.log(req.file);
  res.json({ url: `/img/${req.file.filename}` });
});

module.exports = router;