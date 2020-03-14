'use strict'

var jwt = require('jwt-simple');
var moment = require('moment');

//verify that user is authenticated before continuing
exports.ensureAuth = function(req, res, next) {
	if (!req.headers.authorization) {
		return res.status(403).send({message: 'request does not have the authentication header'});
	} 

	var token = req.headers.authorization.replace(/['"]+/g, '');

	try{
		var payload = jwt.decode(token, 'Cesar_conceptsInEldercare_secretkey');
		if(payload.exp <= moment().unix()){
			return res.status(401).send({
				message: 'token has expired'
			});
		}
	} catch(ex){
		return res.status(404).send({
				message: 'token is not valid'
			});
	}
	req.user = payload;

	next();
}