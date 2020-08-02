const { User } = require('../models');

const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');

module.exports = (passport) => {
    passport.use(new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password'
    }, async (email, password, done) => {    // done(에러, 성공, 실패)
        try {
            const exUser = await User.findOne({ where: { email }});
            if(exUser) {
                const result = await bcrypt.compare(password, exUser.password);
                console.log('result', result);
                if(result) {
                    done(null, exUser);
                } else {
                    done(null, false, { message: '비밀번호가 일치하지 않습니다.' });
                }
            } else {
                done(null, false, { message: '가입되지 않은 회원입니다.' });
            }
        } catch(error) {
            console.error(error);
            done(error);
        }
    }));
}