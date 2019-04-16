var express = require('express');
var router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const randtoken = require('rand-token');
const SECRET = require('../config/keys').SECRET;
// Models
const User = require('../models/User');
const Refresh = require('../models/Refresh');
const passport = require('passport');

// send success login state to client
router.get('/success', (req, res) => {
	res.json({ state: 'success', user: req.user ? req.user : null });
});

// send failure login state to client
router.get('/failure', (req, res) => {
	res.json({ state: 'failure', user: null, message: 'Error while authenticating user' });
});

// send failure login state to client
router.get('/test', passport.authenticate('jwt'), (req, res) => {
	res.json({ operation: 'Test', message: 'Testing was O.K' });
});

// Register Handle
router.post('/register', (req, res) => {
	const { name, email, password, password2 } = req.body;
	let errors = [];
	if (!name) {
		errors.push({ msg: 'Name is required for registration!' });
	}
	if (!email) {
		errors.push({ msg: 'Email is required for registration!' });
	}
	if (!password || !password2 || password !== password2) {
		errors.push({ msg: 'Password and the Confirmation is Required and must be the same' });
	}
	if (password && password.length < 6) {
		errors.push({ msg: 'Password must 6  or more characters long!' });
	}

	if (errors.length > 0) {
		// There are errors
		res.json(403, {
			errors,
			name,
			email
		});
	} else {
		// Check for current user existence by email
		User.findOne({ email })
			.then((user) => {
				if (user) {
					errors.push({ msg: `${email} already registered` });
					res.json(403, {
						status: 'failure',
						errors,
						name,
						email
					});
				} else {
					let newUser = new User({
						name,
						email,
						password,
						role: 'default'
					});
					// Hash the password then save the registered user
					bcrypt.genSalt(10, (err, salt) => {
						bcrypt.hash(newUser.password, salt, (err, hash) => {
							if (err) {
								throw err;
							}
							// Set password to the hash
							newUser.password = hash;
							// Save the user
							newUser
								.save()
								.then((user) => {
									// req.flash('success_msg', 'Registration Successful');
									res.status(201).json({ message: 'Registration Successful' });
								})
								.catch((err) => {
									throw err;
								});
						});
					});
				}
			})
			.catch((error) => {
				return done(error, false, { message: 'Error while signing up!' });
			});
	}
});

// Log in handle
router.post('/login', (req, res) => {
	const { email, password } = req.body;
	// Match User
	User.findOne({ email })
		.then((user) => {
			if (!user) {
				res.status(401).json({ message: `${email} is not registered!` });
			} else {
				// Match password
				bcrypt.compare(password, user.password, (err, isMatch) => {
					if (err) throw err;
					if (isMatch) {
						const tokenUser = {
							name: user.name,
							email: user.email,
							role: user.role
						};
						const token = jwt.sign(tokenUser, SECRET, { expiresIn: 300 });
						const refreshToken = randtoken.uid(256);
						let refresh = new Refresh({
							token: refreshToken,
							bearer: user.id
						});
						refresh
							.save()
							.then((token) => {
								console.log('Token generated and saved');
							})
							.catch((error) => {
								console.log(error);
							});
						res.json({ message: 'Login Successful!', jwt: token, refreshToken: refreshToken });
					} else {
						res.status(403).json({ message: 'Login Unsuccessful! - Wrong Password' });
					}
				});
			}
		})
		.catch((error) => {
			res.status(400).json(error, { message: 'Error during authentication!' });
		});
});

// Refresh token
router.post('/refresh', function(req, res) {
	const { refreshToken } = req.body;
	Refresh.findOne({ token: refreshToken })
		.then((token) => {
			if (token) {
				User.findById(token.bearer).then((user) => {
					if (user) {
						const tokenUser = {
							name: user.name,
							email: user.email,
							role: user.role
						};
						const token = jwt.sign(tokenUser, SECRET, { expiresIn: 300 });
						res.json({ jwt: token });
					} else {
						res.status(401).json({ error: 'Error during validation!' });
					}
				});
			} else {
				res.status(401).json({ error: 'Error during validation!' });
			}
		})
		.catch((error) => {
			console.log(error);
		});
});

// Logout Handle
router.post('/logout', (req, res) => {
	const { refreshToken } = req.body;
	Refresh.findOneAndDelete({ token: refreshToken })
		.then((data) => {
			res.sendStatus(204);
		})
		.catch((error) => {
			console.log(error);
		});
});

module.exports = router;
