'use strict'

var User = require('../models/user');

//encrypt password
var bcrypt = require('bcrypt-nodejs');

var moment = require('moment');

var jwt = require('../services/jwt');

var fs = require('fs');
var path = require('path');

//upload files
const IncomingForm = require('formidable').IncomingForm;

//test
function test(req, res){
	res.status(200).send({message: 'test: ok'});
}

function validateData(err, user, res){
	if(err.code == 11000){ //Duplicated user
		return res.status(404).send({message: 'Email already exists.'});
	}
	if (err.errors.email.name == 'ValidatorError') { //Email is invalid 
		return res.status(404).send({message: 'Email is invalid.'});
	}
	return res.status(500).send({message: 'Error saving user.'});
}

//register a user
function saveUser(req, res) {

	var params = req.body,
		user = new User();

		/*(user.name = params.name) && (user.lastname = params.lastname) && 
		(user.address = params.address) && (user.city = params.city) && 
		(user.state = params.state) && (user.postal_code = params.postal_code) && 
		(user.phone = params.phone) && */

	//Verify that all fields have been filled
	if((user.email = params.email) && params.password)
	{

		user.mi = (params.mi)? params.mi: null;
		user.address2 = (params.address2)? params.address2: null;

		//encrypt password
		return bcrypt.hash(params.password, null, null, (err, hash) => {
			if (err)
				return res.status(500).send({message: 'Error encrypting password'});
			user.password = hash;

			user.role = (params.role)? params.role: 'ROLE_USER';
			user.created_at = moment().unix();

			//Save user
			return user.save((err, userStored) => {
				if (err) {
					return validateData(err, user, res);
				}
				if (userStored) { //success
					userStored.password = undefined;
					return res.status(200).send({user: userStored});
				}
				return res.status(404).send({message: 'User could not be registered'});
				
			});

		});					
		
	}
		
	return res.status(200).send({message: 'User data are incomplete!'});

}

//login a user. Receives nickname or email
function loginUser(req, res) {
	var params = req.body,
		email,
		password;

	if (!((email = params.email) && (password = params.password))) {
		return res.status(200).send({message: 'User data are incomplete!'});
	}

	User.findOne({email: email = email.toLowerCase()}, (err, user) => {
		if (err) {
			res.status(500).send({message: 'Error in the request of users.'});
		} else if (user) {
			bcrypt.compare(password, user.password, (err, check) => {
				user.password = undefined;
				if (check) { //return user's data
					if (params.gettoken) { //return user's encrypted data
						//create token
						res.status(200).send({user: {
							identity: user,
							token: jwt.createToken(user)
						}});
					} else { //return user's flat data
						res.status(200).send({user});
					}
				} else {
					res.status(404).send({message: 'Email or Password you entered was incorrect.'});
				}
			});
			
		} else {
			res.status(404).send({message: 'Email or Password you entered was incorrect.'});
		}
	}); 

}

//get user data
function getUser(req, res) {

	User.findById(req.params.id, (err, user) => {
		if (err) return res.status(500).send({message: 'Error in the request of users.'});
		if (!user) return res.status(404).send({message: 'User not exists.'});
		user.password = undefined;
		return res.status(200).send({user});
	});
}

//get paged list of users
function getUsers(req, res) {
	var identity_user_id = req.user.sub;
	
	//Default page = 1
	var page;
	if (!(page = req.params.page)) page = 1;

	////Default itemsPerPage = 5
	var itemsPerPage;
	if (!(itemsPerPage = parseInt(req.params.itemsPerPage))) itemsPerPage = 5;
	
	User.find({},null,{skip:(itemsPerPage*(page-1)),limit:itemsPerPage},(err,users)=> {
		if (err) {
			return res.status(500).send({message: 'Error in the request of users.'});
		}
		if (!users) {
			return res.status(404).send({message: 'No users available.'});
		}
        User.countDocuments((err,total) => {
            if(err) {
            	return res.status(500).send({message: 'Error in the request counting documents'});
            }
            
            return res.status(200).send({
                users,
                total,
                pages: Math.ceil(total/itemsPerPage)
            });

        });
    });

}

//Update user
function updateUser(req, res) {

	var update = req.body;

	//delete user's password and role
	delete update.email;
	delete update.password;
	delete update.role;

	var userId;
	if((userId = req.params.id) != req.user.sub) {
		return res.status(500).send({message: 'Permission denied'});
	}

	//update user
	return User.findByIdAndUpdate(userId, update, {new:true}, (err, userUpdated) => {
		if (err) {
			return validateData(err, update, res);
		}
		if (!userUpdated) {
			return res.status(404).send({message: 'User could not be updated.'});
		}
		userUpdated.password = undefined;
		return res.status(200).send({user: userUpdated});
	});

}

//upload user's image
function uploadImage(req, res) {
	var userId;
	var file_path = req.files.image.path;

	if ((userId = req.params.id) != req.user.sub) {
		return removeFilesOfUploads(res, file_path, 'Permission denied.');
	}

	var image;

	if (req.files && (image = req.files.image)) {

		if (image.type.indexOf('image/') != 0) return removeFilesOfUploads(res, file_path, 'File is not an image.');
		
		return User.findByIdAndUpdate(userId, {driver_lic: file_path.substring(file_path.lastIndexOf('\\') + 1)}, {new:true}, (err, userUpdated) => {
			if (err) {
				return removeFilesOfUploads(res, file_path, 'Error updating user.');
			}
			if (!userUpdated) {
				return removeFilesOfUploads(res, file_path, 'User could not be updated.');
			}
			userUpdated.password = undefined;
			return res.status(200).send({user: userUpdated});
		});

	}

	return res.status(404).send({message: 'No images have been uploaded'});
}

//upload user's files
function upload(req, res) {

	/*if ((userId = req.params.id) != req.user.sub) {
		return removeFilesOfUploads(res, file_path, 'Permission denied.');
	}*/

	var userId = req.params.id;

	var form = new IncomingForm();

	form.uploadDir = './uploads/users';
	form.keepExtensions = true;

	form.on('file', (field, file) => {

		var file_path = file.path;

		console.log('fp: ' + file_path);

	    return User.findByIdAndUpdate(userId, {[req.params.id_doc]: file_path.substring(file_path.lastIndexOf('\\') + 1)}, {new:true}, (err, userUpdated) => {
			if (err) {
				return removeFilesOfUploads(res, file_path, 'Error updating user.');
			}
			if (!userUpdated) {
				return removeFilesOfUploads(res, file_path, 'User could not be updated.');
			}
			userUpdated.password = undefined;
			//return res.status(200).send({user: userUpdated});
		});

	});

	form.on('end', () => {
	    res.json();
	});

	form.parse(req);

}

//Remove uploading file
function removeFilesOfUploads (res, file_path, msg) {
	fs.unlink(file_path, (err) => {
		if (err) 
			return res.status(500).send({message: msg + ' Error unlinking'});

		//return res.status(404).send({message: msg});
	});
}

//Get user image
function getImageFile (req, res) {
	var image_file = req.params.imageFile;
	var path_file = './uploads/users/' + image_file;

	fs.exists(path_file, (exists) => {
		if (exists) {
			res.sendFile(path.resolve(path_file));
		} else {
			res.status(200).send({message: 'Image does not exist'});
		}
	});
}

module.exports = {
	saveUser,
	loginUser,
	getUser,
	getUsers,
	updateUser,
	uploadImage,
	upload,
	getImageFile,
	test
}