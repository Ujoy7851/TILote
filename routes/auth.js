const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const passport = require('passport');

const { User } = require('../models');

router.post('/join', async (req, res, next) => {
  const { email, username, password } = req.body;
  try {
    const user = await User.findOne({ where: { email } });
    if(user) {
      req.flash('joinError', '이미 가입되어 있습니다.');
      return res.redirect('/join');
    } else {
      const hash = await bcrypt.hash(password, 12);
      await User.create({
        email,
        username,
        password: hash
      });
      return res.redirect('/');
    }
  } catch(error) {
    console.error(error);
    next(error);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    passport.authenticate('local', (authError, user, info) => {
      if(authError) {
        console.log(error);
        next(error);
      }
      if(!user) {
        req.flash('loginError', info.message);
        res.redirect('/login');
      }
      req.login(user, (loginError) => {
        if(loginError) {
          console.error(loginError);
          next(loginError);
        }
        res.redirect('/');
      })
    })(req, res, next);
  } catch(error) {
    console.error(error);
    next(error);
  }
});

router.get('/logout', (req, res, next) => {
  req.logout();
  req.session.destroy();
  res.redirect('/');
})


module.exports = router;