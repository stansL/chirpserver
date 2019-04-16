var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const passport = require('passport');
const session = require('express-session');
const indexRouter = require('./routes/index');
const chirpsRouter = require('./routes/chirps');
const authenticateRouter = require('./routes/auth');
var usersRouter = require('./routes/users');
const mongoose = require('mongoose');
const cors = require('cors')

var app = express();

// Passport Config
require('./config/passport')(passport);

// DB Config
const db = require('./config/keys').MongoURI;

// Connect to MongoDB
mongoose
	.connect(db, { useNewUrlParser: true })
	.then(() => {
		console.log('Mongo DB Connected!');
	})
	.catch((err) => {
		console.log(err);
	});
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(
	session({
		secret: 'some secret',
		resave: true,
		saveUninitialized: true
	})
);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(passport.initialize());
app.use(passport.session());
app.use(cors());

app.use('/', indexRouter);
app.use('/chirps', chirpsRouter);
app.use('/auth', authenticateRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use((req, res, next) => {
	next(createError(404));
});

// error handler
app.use((err, req, res, next) => {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};

	// render the error page
	res.status(err.status || 500);
	res.render('error');
});

module.exports = app;
