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
        // parent_comment: req.body.parent
      });
    }
    console.log(post);
    // res.send('OK');
    res.redirect(`/post/${post.id}`);
  } catch(error) {
    console.error(error);
    next(error);
  }
});


module.exports = router;