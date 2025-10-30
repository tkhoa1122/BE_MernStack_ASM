require('dotenv').config();
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose = require('mongoose');
var { attachUserFromToken } = require('./middleware/auth');
var setupSwagger = require('./swagger');

var indexRouter = require('./routes/index');
var authRouter = require('./routes/auth');
var adminBrandsRouter = require('./routes/api/brands');
var adminPerfumesRouter = require('./routes/api/perfumes');
var adminMembersRouter = require('./routes/api/members');

var app = express();

// Middleware
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// DB connection
const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/as1';
mongoose
  .connect(mongoUri)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Attach user from JWT cookie
app.use(attachUserFromToken);

// Setup Swagger documentation
setupSwagger(app);

// API Routes
app.use('/', indexRouter); // Public API endpoints
app.use('/', authRouter); // Auth API endpoints (with /auth prefix in router)
app.use('/api/brands', adminBrandsRouter); // Admin Brand API
app.use('/api/perfumes', adminPerfumesRouter); // Admin Perfume API
app.use('/api/members', adminMembersRouter); // Admin Members API

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  res.status(404).json({ 
    success: false, 
    message: 'Endpoint not found',
    path: req.path 
  });
});

// error handler
app.use(function(err, req, res, next) {
  // Return JSON error
  res.status(err.status || 500).json({
    success: false,
    message: err.message,
    error: req.app.get('env') === 'development' ? err : {}
  });
});

module.exports = app;
