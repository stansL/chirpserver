const mongoose = require('mongoose');
const UserSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true
	},
	role: {
		type: String,
		required: true
	},
	email: {
		type: String,
		required: true
	},
	password: {
		type: String,
		required: true
	},
	date_created: {
		type: Date,
		default: Date.now
	},
	status:{
		type: Boolean,
		default:false
	}
});

const User = mongoose.model('user', UserSchema);
module.exports = User;
