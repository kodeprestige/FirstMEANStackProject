'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = Schema({
	name: String,
	mi: String,
	lastname: String,
	birthday: String,
	gender: String,
	address: String,
	address2: String,
	city: String,
	state: String,
	zip_code: String,
	phone: String,
	email: { type: String, lowercase: true, match: /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/, unique: true },
	password: String,
	role: String,
	speciality: String,
	state_lic: String,
	proof_of_liability_insurance: String,
	cpr_card: String,
	hiv_aids: String,
	osha: String,
	dom_violence: String,
	driver_lic: String,
	auto_insurance: String,
	residency: String,
	ssc: String,
	physical_exam: String,
	created_at: String
});

module.exports = mongoose.model('User', UserSchema);