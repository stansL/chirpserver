const mongoose = require('mongoose');
const ChirpSchema = new mongoose.Schema({
	text: {
		type: String,
		required: true
	},
	created_by: {
		type: String,
		required: true
	},
	created_at: {
		type: Date,
		default: Date.now
	},
	modified_at: {
		type: Date
	}
});

const Chirp = mongoose.model('chirp', ChirpSchema);
module.exports = Chirp;
