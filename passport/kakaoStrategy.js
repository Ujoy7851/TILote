const kakaoStrategy = require('passport-kakao').Strategy;

const { User } = require('../models');

module.exports = (passport) => {
    passport.use(new kakaoStrategy({
        clientID: process.env.KAKAO_ID,
        callbackURL: 'https://www.tilote.com/auth/kakao/callback',
    }, async (accessToken, refreshToken, profile, done) => {
        const exUser = await User.findOne({
            where: {
                social_id: profile.id,
                provider: 'kakao',
            }
        });
        if(exUser) {
            done(null, exUser);
        } else {
            const newUser = await User.create({
                email: profile._json && profile._json.kakao_account.email,
                username: profile._json.kakao_account.profile.nickname,
                social_id: profile.id,
                provider: 'kakao',
            });
            done(null, newUser)
        }
    }));
}