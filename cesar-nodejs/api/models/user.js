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
	state_lic_file: String,
	proof_of_liability_insurance_file: String,
	cpr_card_file: String,
	hiv_aids_file: String,
	osha_file: String,
	dom_violence_file: String,
	driver_lic_file: String,
	auto_insurance_file: String,
	residency_file: String,
	ssc_file: String,
	physical_exam_file: String,
	created_at: String
});

module.exports = mongoose.model('User', UserSchema);