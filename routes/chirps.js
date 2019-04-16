var express = require('express');
var router = express.Router();
const Chirp = require('../models/Chirp');
const User = require('../models/User');
const passport = require('passport');

/* GET chirps listing. */
router.get('/', passport.authenticate('jwt'), (req, res, next) => {
	Chirp.find()
		.then((data) => {
			res.json(data);
		})
		.catch((error) => {
			console.log(error);
		});
});

/* GET chirp by id */
router.get('/:id', passport.authenticate('jwt'), (req, res, next) => {
	Chirp.findById(req.params.id)
		.then((chirp) => {
			if (chirp) {
				res.json(chirp);
			} else {
				res.status(404).json({ message: `Chirp with ID ${req.params.id} not found!` });
			}
		})
		.catch((error) => {
			res.json({ message: 'Error occured while retrieving Chirp', error });
		});
});

/* POST a chirp */
router.post('/', passport.authenticate('jwt'), (req, res) => {
	const { text, created_by } = req.body;
	let newChirp = new Chirp({
		text,
		created_by
	});
	newChirp
		.save()
		.then((chirp) => {
			res.status(201).json({ message: 'Chirp saved successfully', chirp });
		})
		.catch((err) => {
			throw err;
		});
});

/* PUT a chirp */

router.put('/:id', passport.authenticate('jwt'), (req, res) => {
	Chirp.findById(req.params.id)
		.then((chirp) => {
			if (chirp) {
				const { text, created_by } = req.body;
				if (text) {
					chirp.text = text;
				}
				if (created_by) {
					chirp.created_by = created_by;
				}
				chirp.modified_at = new Date();
				chirp
					.save()
					.then((chirp) => {
						res.status(201).json({ message: 'Chirp Updated successfully', chirp });
					})
					.catch((err) => {
						throw err;
					});
			} else {
				res.status(404).json({ message: `Chirp with ID ${req.params.id} not found!` });
			}
		})
		.catch((error) => {
			res.status(403).json({ message: 'Error occured while retrieving Chirp', error });
		});
});

/* DELETE a chirp */
router.delete('/:id', passport.authenticate('jwt'), (req, res) => {
	Chirp.findByIdAndDelete(req.params.id)
		.then((data) => {
			res.sendStatus(204);
		})
		.catch((error) => {
			res.status(403).json({ message: `Error deleting a Chirp with id ${req.params.id}`, error });
		});
});

module.exports = router;
