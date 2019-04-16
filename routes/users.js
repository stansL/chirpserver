var express = require('express');
var router = express.Router();
const passport = require('passport');
// User Model
const User = require('../models/User');

/* GET users listing. */
router.get('/', passport.authenticate('jwt'), (req, res, next) => {
	User.find()
		.then((data) => {
			res.json(data);
		})
		.catch((error) => {
			res.json({ message: 'Error while fetching users', error });
		});
});

/* GET user by ID. */
router.get('/:id', passport.authenticate('jwt'), (req, res, next) => {
	User.findById(req.params.id)
		.then((data) => {
			if (data) {
				res.json(data);
			} else {
				res.status(404);
				res.json({ message: `User with ID ${req.params.id} not found!` });
			}
		})
		.catch((error) => {
			res.status(400);
			res.json({ message: `Error while fetching user with ID ${req.params.id}`, error });
		});
});




module.exports = router;
