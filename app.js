const express = require('express');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const path = require('path');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const redis = require('redis');
const RedisStore = require('connect-redis')(session);
const methodOverride = require('method-override');
const logger = require('./config/logger');
const helmet = require('helmet');
const hpp = require('hpp');
const { expressCspHeader, INLINE, NONE, SELF } = require('express-csp-header');
require('dotenv').config();

const indexRouter = require('./routes');
const authRouter = require('./routes/auth');
const postRouter = require('./routes/post');
const userRouter = require('./routes/user');
const commentRouter = require('./routes/comment');
const { sequelize } = require('./models');
const passportConfig = require('./passport');

const app = express();
sequelize.sync();
passportConfig(passport);

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
app.set('port', process.env.PORT || 8080);

if(process.env.NODE_ENV === 'production') {
  app.use(morgan('combined'));
  app.use(helmet());
  app.use(hpp());
} else { //development
  app.use(morgan('dev'));
}

app.use(express.static(path.join(__dirname, 'public')));
app.use('/img', express.static(path.join(__dirname, 'uploads')));
app.use(express.json());
app.use(express.urlencoded({ extended: false}));
app.use(cookieParser(process.env.COOKIE_SECRET));

const client = redis.createClient({
  logErrors: true
});

const sessionOption = {
  resave: false,
  saveUninitialized: false,
  secret: process.env.COOKIE_SECRET,
  cookie: {
      httpOnly: true,
      secure: true
  },
  store: new RedisStore({ client })
};

if(process.env.NODE_ENV === 'production') {
  sessionOption.proxy = true;
  sessionOption.cookie.secure = true;  //https
}

app.use(session(sessionOption));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride('_method'));
app.use(expressCspHeader({
  directives: {
      'script-src-attr': ['unsafe-inline']
  }
}));

app.use('/', indexRouter);
app.use('/auth', authRouter);
app.use('/post', postRouter);
app.use('/user', userRouter);
app.use('/comments', commentRouter);

app.use((req, res, next) => {
    const err = new Error('Not Found');
    err.status = 404;
    logger.errror(err);
    next(err);
});

app.use((err, res, req) => {
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    res.status(err.status || 500);
    res.render('error');
});

app.listen(app.get('port'), () => {
    logger.info(`${app.get('port')}번 포트에서 서버 실행중...`);
});