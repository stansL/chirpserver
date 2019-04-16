const mongoose = require('mongoose');
const RefreshSchema = new mongoose.Schema({
	token: {
		type: String,
		required: true
	},
	bearer: {
		type: String,
		required: true
	},

	created_at: {
		type: Date,
		default: Date.now
	}
});

const Refresh = mongoose.model('refresh', RefreshSchema);
module.exports = Refresh;
