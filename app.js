require('dotenv').config();
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose = require('mongoose');
var { attachUserFromToken } = require('./middleware/auth');
var setupSwagger = require('./swagger');
// Xóa dòng import passport
// var passport = require('passport');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var authRouter = require('./routes/auth');
var adminBrandsRouter = require('./routes/api/brands');
var adminPerfumesRouter = require('./routes/api/perfumes');
var membersRouter = require('./routes/members');
var adminDashboardRouter = require('./routes/admin');
// Xóa dòng import oauth router
// var oauthRouter = require('./routes/oauth');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
// Xóa dòng passport initialize
// app.use(passport.initialize());

// DB connection
const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/as1';
mongoose
  .connect(mongoUri)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Attach user from JWT cookie (for views and APIs)
app.use(attachUserFromToken);

// Setup Swagger documentation
setupSwagger(app);

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/', authRouter); // /login, /register, /logout, /me routes
// Xóa dòng oauth route
// app.use('/oauth', oauthRouter); // /oauth/google, /oauth/google/callback
// Admin-only APIs
app.use('/api/brands', adminBrandsRouter);
app.use('/api/perfumes', adminPerfumesRouter);
// Members admin utilities (e.g., /collectors)
app.use('/', membersRouter);
// Admin dashboard UI
app.use('/dashboard', adminDashboardRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
