const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const passport = require('passport');

const { User } = require('../models');
const logger = require('../config/logger');

router.post('/join', async (req, res, next) => {
  const { email, username, password } = req.body;
  const emailRegExp = /^[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*\.[a-zA-Z]{2,3}$/i;
  const pwRegExp = /^[a-zA-Z0-9]{6,12}$/
  try {
    const user = await User.findOne({ where: { email } });
    if(user) {
      req.flash('joinError', '이미 가입되어 있습니다.');
      return res.redirect('/join');
    } else if(!emailRegExp.test(email)) {
      req.flash('joinError', '이메일 형식이 옳지 않습니다.');
      return res.redirect('/join');
    } else if(!pwRegExp.test(password)) {
      req.flash('joinError', '비밀번호는 영문 대소문자와 숫자 6~12자리로 입력하세요.');
      return res.redirect('/join');
    } else {
      const hash = await bcrypt.hash(password, 12);
      await User.create({
        email,
        username,
        password: hash
      });
      passport.authenticate('local', (authError, user, info) => {
        if(authError) {
          logger.error(error);
          next(error);
        }
        if(!user) {
          req.flash('loginError', info.message);
          res.redirect('/login');
        }
        req.login(user, (loginError) => {
          if(loginError) {
            logger.error(loginError);
            next(loginError);
          }
          res.redirect('/');
        })
      })(req, res, next);
    }
  } catch(error) {
    logger.error(error);
    next(error);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    passport.authenticate('local', (authError, user, info) => {
      if(authError) {
        logger.info(error);
        next(error);
      }
      if(!user) {
        req.flash('loginError', info.message);
        res.redirect('/login');
      }
      req.login(user, (loginError) => {
        if(loginError) {
          logger.error(loginError);
          next(loginError);
        }
        res.redirect('/');
      })
    })(req, res, next);
  } catch(error) {
    logger.error(error);
    next(error);
  }
});

router.get('/kakao', passport.authenticate('kakao'));

router.get('/kakao/callback', passport.authenticate('kakao', {
  failureRedirect: '/',
}), (req, res) => {
  console.log('req.user', req.user);
  res.redirect('/');
});

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback', passport.authenticate('google', {
  failureRedirect: '/',
}), (req, res) => {
  console.log('req.user', req.user);
  res.redirect('/');
});

router.get('/logout', (req, res, next) => {
  req.logout();
  req.session.destroy();
  res.redirect('/');
});


module.exports = router;