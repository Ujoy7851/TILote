const { User } = require('../models');

const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');

module.exports = (passport) => {
  passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
  }, async (email, password, done) => {
    try {
      const user = await User.findOne({ where: { email } });
      if(user) {
        const result = await bcrypt.compare(password, user.password);
        if(result) {
          done(null, user);
        } else {
          done(null, false, { message: '입력을 확인하세요.' });
        }
      } else {
        done(null, false, { message: '입력을 확인하세요.' });
      }
    } catch(error) {
      console.error(error);
      done(error);
    }
  }));
}