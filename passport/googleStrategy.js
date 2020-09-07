const GoogleStrategy = require('passport-google-oauth20').Strategy;

const { User } = require('../models');

module.exports = (passport) => {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_ID,
    clientSecret: process.env.GOOGLE_SECRET,
    callbackURL: 'https://www.tilote.com/auth/google/callback'
  }, async (accessToken, refreshToken, profile, cb) => {
    try {
      const { id, _json: { name, email }} = profile;
      const exUser = await User.findOne({
        where: {
          social_id: id,
          provider: 'google',
        }
      });
      if(exUser) {
        return cb(null, exUser);
      } else {
        const newUser = await User.create({
          email,
          username: name,
          social_id: id,
          provider: 'google',
        });
        return cb(null, newUser);
      }
    } catch(error) {
      console.error(error);
      cb(error);
    }
  }));
}