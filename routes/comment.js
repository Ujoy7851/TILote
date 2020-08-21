const express = require('express');
const router = express.Router();
const { User, Post, Comment } = require('../models');
const { isLoggedIn } = require('./middlewares');

router.post('/', isLoggedIn, async (req, res, next) => {
  try {
    const post = await Post.findOne({
      where: { id: req.query.postId }
    });
    if(post) {
      const comment = await Comment.create({
        UserId: req.user.id,
        PostId: post.id,
        content: req.body.content,
        is_deleted: false
        // parent_comment: req.body.parent
      });
    }
    // console.log(post);
    // res.send('OK');
    res.redirect(`/post/${post.id}`);
  } catch(error) {
    console.error(error);
    next(error);
  }
});

router.put('/:commentId', isLoggedIn, async (req, res, next) => {
  try {
    await Comment.update({
      content: req.body.content
    }, {
      where: { id: req.params.commentId }
    });
    // console.log('=================', req.query.postId);
    res.redirect(`/post/${req.query.postId}`);
  } catch(error) {
    console.error(error);
    next(error);
  }
});

router.delete('/:commentId', isLoggedIn, async (req, res, next) => {
  try {
    await Comment.update({
      is_deleted: true
    }, {
      where: { id: req.params.commentId }
    });
  
    res.redirect(`/post/${req.query.postId}`);
  } catch(error) {
    console.error(error);
    next(error);
  }
});

module.exports = router;