const kakaoStrategy = require('passport-kakao').Strategy;

const { User } = require('../models');

module.exports = (passport) => {
    passport.use(new kakaoStrategy({
        clientID: process.env.KAKAO_ID,
        callbackURL: '/auth/kakao/callback',
    }, async (accessToken, refreshToken, profile, done) => {
        const exUser = await User.findOne({
            where: {
                snsId: profile.id,
                provider: 'kakao',
            }
        });
        if(exUser) {
            done(null, exUser);
        } else {
            console.log('profile', profile);
            const newUser = await User.create({
                email: profile._json && profile._json.kakao_account.email,
                nick: profile._json.kakao_account.profile.nickname,
                snsId: profile.id,
                provider: 'kakao',
            });
            done(null, newUser)
        }
    }));
}