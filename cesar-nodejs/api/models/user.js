'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = Schema({
	name: String,
	lastname: String,
	nick: { type: String, lowercase: true, unique: true},
	email: { type: String, lowercase: true, match: /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/, unique: true },
	password: String,
	role: String,
	image: String,
	created_at: String
});

module.exports = mongoose.model('User', UserSchema);