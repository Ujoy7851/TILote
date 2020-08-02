// const GoogleStrategy = require('passport-google-oauth20').Strategy;

// const { User } = require('../models');

// module.exports = (passport) => {
//   passport.use(new GoogleStrategy({
//     clientID: process.env.GOOGLE_ID,
//     clientSecret: process.env.GOOGLE_SECRET,
//     callbackURL: '/auth/google/callback'
//   }, async (accessToken, refreshToken, profile, cb) => {
//     try {
//       const { id, _json: { name, email }} = profile;
//       const exUser = await User.findOne({
//         where: {
//           snsId: id,
//           provider: 'google',
//         }
//       });
//       if(exUser) {
//         return cb(null, exUser);
//       } else {
//         const newUser = await User.create({
//           email,
//           nick: name,
//           snsId: id,
//           provider: 'google',
//         });
//         return cb(null, newUser);
//       }
//     } catch(error) {
//       console.error(error);
//       cb(error);
//     }
//   }));
// }