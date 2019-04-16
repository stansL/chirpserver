const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const bcrypt = require('bcrypt');
const SECRET = require('../config/keys').SECRET;
const passportOpts = {
	jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
	secretOrKey: SECRET
};

// User Model
const User = require('../models/User');

module.exports = (passport) => {
	passport.use(
		new JwtStrategy(passportOpts, (jwtPayload, done) => {
			const expirationDate = new Date(jwtPayload.exp * 1000);
			if (expirationDate < new Date()) {
				return done(null, false);
			}
			done(null, jwtPayload);
		})
		// new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
		// 	// Match User
		// 	User.findOne({ email: email })
		// 		.then((user) => {
		// 			if (!user) {
		// 				return done(null, false, { message: `${email} is not registered!` });
		// 			} else {
		// 				// Match password
		// 				bcrypt.compare(password, user.password, (err, isMatch) => {
		// 					if (err) throw err;
		// 					if (isMatch) {
		// 						return done(null, user, { message: 'Login Successful!' });
		// 					} else {
		// 						return done(null, false, { message: 'Incorrect Password!' });
		// 					}
		// 				});
		// 			}
		// 		})
		// 		.catch((error) => {
		// 			return done(error, false, { message: 'Error during authentication!' });
		// 		});
		// })
	);

	passport.serializeUser((user, done) => {
		done(null, user.email);
	});

	passport.deserializeUser((email, done) => {
		User.findOne({ email }, (err, user) => {
			done(err, user);
		});
	});
};
