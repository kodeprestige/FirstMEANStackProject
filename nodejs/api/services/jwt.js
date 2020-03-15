'use strick'

var jwt = require('jwt-simple');
var moment = require('moment');

//encrypt user data
exports.createToken = function (user) {
	var payload = {
		sub: user._id,
		name: user.name,
		lastname: user.lastname,
		nick: user.nick,
		email: user.email,
		role: user.role,
		image: user.image,
		created_at: user.created_at,
		iat: moment().unix(),
		exp: moment().add(1, 'days').unix()
	};

	//return user's encrypted data
	return jwt.encode(payload, 'Cesar_conceptsInEldercare_secretkey');

};