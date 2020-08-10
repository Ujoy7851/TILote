const express = require('express');
const { User, Post } = require('../models');
const router = express.Router();

router.get('/:username', async (req, res, next) => {
  try {
    const user = await User.findOne({
      where: { username: req.params.username }
    });
    if(user) {
      const posts = await Post.findAll({
        where: {
          UserId: user.id
        },
        include: {
          model: User,
          attributes: ['id', 'username']
        },
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
      res.render('user', {
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

module.exports = router;