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

					//test
					pdffiller(user.id);

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

	    return User.findByIdAndUpdate(userId, {[req.params.id_doc + '_file']: file_path.substring(file_path.lastIndexOf('\\') + 1)}, {new:true}, (err, userUpdated) => {
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


//test
var pdfFiller = require('pdffiller');
var fs = require('fs');

/*function pdffiller(req, res) {

	var userId;
	if((userId = req.params.id) != req.user.sub) {
		return res.status(500).send({message: 'Permission denied'});
	}

	var opt;

	if (opt = req.body.opt) {*/


function pdffiller(userId) {

	var opt = "1";
		var sourcePDF;
		var destinationPDF;
		var data;

		User.findById(userId, (err, user) => {
			if (err) return res.status(500).send({message: 'Error in the request of users.'});
			if (!user) return res.status(404).send({message: 'User not exists.'});
			user.password = undefined;

			console.log(user.id);
			console.log(user);

			var opt = "1";
			var sourcePDF;
			var destinationPDF;
			var data;

			switch (opt) {
			case "1":
				sourcePDF = './forms/source_forms/3.pdf';
				destinationPDF = './forms/filled_forms/3_' + userId + '.pdf';

				/*
		         * Pasas tantos parametros como te haga 
		         * falta los cuales que te ayudan a rallenar 
		         * las variables que vas a como valor en la tabla hash 
		         * que estas devolviendo al final del metodo         * 
		         * 
		         */
		        //ejemplo para los radio buttons y el chebox que esta solo
		        // todo en off para que salga deselcionados 
		        var op1, op2, op3, chbox;
		        op1 = "Off";
		        op2 = "Off";
		        op3 = "Off";
		        chbox = "Off";
		        // ahy que fijarse siempre en los posibles estados de cada boton 
		        //y solo se reaccionan si les pones un estado que les corresponde

		        var radioselecionado = "3";
		        switch (radioselecionado) {
		            case "1":
		                op1 = "1";
		                console.log("1");
		                break;
		            case "2":
		                op2 = "2";
		                console.log("2");
		                break;
		            case "3":
		                op3 = "3";
		                console.log("3");
		                break;
		        }

		        var elOtrocheckbox = "1";
		        if (elOtrocheckbox === "1") {
		            chbox = "1";
		        }



		        data = {
		            "NAME": user.name, //Text
		            "SOCIAL SECURITY NUMBER": user.ss, //Text
		            "PRESENT ADDRESS": "PRESENT ADDRESS", //Text
		            "PERMANENT ADDRESS IF DIFFERENT": "PERMANENT ADDRESS IF DIFFERENT", //Text
		            "PHONE": "PHONE", //Text
		            "REFERRED BY": "REFERRED BY", //Text
		            "NAME  LOCATION OF SCHOOLGRAMMAR SCHOOL": "NAME  LOCATION OF SCHOOLGRAMMAR SCHOOL", //Text
		            "YEARS ATTENDEDGRAMMAR SCHOOL": "YEARS ATTENDEDGRAMMAR SCHOOL", //Text
		            "SUBJECT STUDIEDGRAMMAR SCHOOL": "SUBJECT STUDIEDGRAMMAR SCHOOL", //Text
		            "NAME  LOCATION OF SCHOOLHIGH SCHOOL": "NAME  LOCATION OF SCHOOLHIGH SCHOOL", //Text
		            "YEARS ATTENDEDHIGH SCHOOL": "YEARS ATTENDEDHIGH SCHOOL", //Text
		            "SUBJECT STUDIEDHIGH SCHOOL": "SUBJECT STUDIEDHIGH SCHOOL", //Text
		            "NAME  LOCATION OF SCHOOLCOLLEGE": "NAME  LOCATION OF SCHOOLCOLLEGE", //Text
		            "YEARS ATTENDEDCOLLEGE": "YEARS ATTENDEDCOLLEGE", //Text
		            "SUBJECT STUDIEDCOLLEGE": "SUBJECT STUDIEDCOLLEGE", //Text
		            "NAME  LOCATION OF SCHOOLTRADE OTHER SCHOOL": "NAME  LOCATION OF SCHOOLTRADE OTHER SCHOOL", //Text
		            "YEARS ATTENDEDTRADE OTHER SCHOOL": "YEARS ATTENDEDTRADE OTHER SCHOOL", //Text
		            "SUBJECT STUDIEDTRADE OTHER SCHOOL": "SUBJECT STUDIEDTRADE OTHER SCHOOL", //Text
		            "SUBJECTS OF SPECIAL STUDY SPECIAL TRAINING US MILITARY OR NAVAL SERVICERow1": "SUBJECTS OF SPECIAL STUDY SPECIAL TRAINING US MILITARY OR NAVAL SERVICERow1", //Text
		            "FROM TORow1": "FROM TORow1", //Text
		            "NAME  LOCATION OF EMPLOYERRow1": "NAME  LOCATION OF EMPLOYERRow1", //Text
		            "POSITIONRow1": "POSITIONRow1", //Text
		            "REASON FOR LEAVINGRow1": "REASON FOR LEAVINGRow1", //Text
		            "FROM TORow2": "FROM TORow2", //Text
		            "NAME  LOCATION OF EMPLOYERRow2": "NAME  LOCATION OF EMPLOYERRow2", //Text
		            "POSITIONRow2": "POSITIONRow2", //Text
		            "REASON FOR LEAVINGRow2": "REASON FOR LEAVINGRow2", //Text
		            "FROM TORow3": "FROM TORow3", //Text
		            "NAME  LOCATION OF EMPLOYERRow3": "NAME  LOCATION OF EMPLOYERRow3", //Text
		            "POSITIONRow3": "POSITIONRow3", //Text
		            "REASON FOR LEAVINGRow3": "REASON FOR LEAVINGRow3", //Text
		            "DATE": "DATE", //Text
		            "SIGNATURE": "SIGNATURE", //Signature
		            "INTERVIEWED BY": "INTERVIEWED BY", //Text
		            "DATE_2": "DATE_2", //Text
		            "DA TE": "DA TE", //Text
		            "NAME_2": "NAME_2", //Text
		            "RELATIONSHIP": "RELATIONSHIP", //Text
		            "ADDRESS": "ADDRESS", //Text
		            "CITY": "CITY", //Text
		            "STATE": "STATE", //Text
		            "ZIP CODE": "ZIP CODE", //Text
		            "AREA CODE AND TELEPHONE": "AREA CODE AND TELEPHONE", //Text
		            "undefined": "undefined", //Text
		            "NAME_3": "NAME_3", //Text
		            "RELATIONSHIP_2": "RELATIONSHIP_2", //Text
		            "ADDRESS_2": "ADDRESS_2", //Text
		            "CITY_2": "CITY_2", //Text
		            "STATE_2": "STATE_2", //Text
		            "ZIP CODE_2": "ZIP CODE_2", //Text
		            "AREA CODE AND TELEPHONE_2": "AREA CODE AND TELEPHONE_2", //Text
		            "undefined_2": "undefined_2", //Text
		            "I": "I", //Text
		            "EMPLOYEE SIGNATURE": "EMPLOYEE SIGNATURE", //Text
		            "EMPLOYEE NAME_2": "EMPLOYEE NAME_2", //Text
		            "DA TE_2": "DA TE_2", //Text
		            "ADMINISTRATOR Signature": "ADMINISTRATOR Signature", //Signature
		            "EMPLOYEE SIGNATURE_2": "EMPLOYEE SIGNATURE_2", //Text
		            "EMPLOYEE NAME_3": "EMPLOYEE NAME_3", //Text
		            "DA TE_3": "DA TE_3", //Text
		            "EMPLOYEE SIGNATURE_3": "EMPLOYEE SIGNATURE_3", //Text
		            "EMPLOYEE NAME_4": "EMPLOYEE NAME_4", //Text
		            "DA TE_4": "DA TE_4", //Text
		            "EMPLOYEE SIGNATURE_4": "EMPLOYEE SIGNATURE_4", //Text
		            "Employee Signature": "Employee Signature", //Signature
		            "Date": "Date", //Text
		            "topmostSubform[0].Page1[0].f1_01_0_[0]": "topmostSubform[0].Page1[0].f1_01_0_[0]", //Text
		            "topmostSubform[0].Page1[0].f1_02_0_[0]": "topmostSubform[0].Page1[0].f1_02_0_[0]", //Text
		            "topmostSubform[0].Page1[0].c1_01[0]": "1", //Button{1:Off}
		            "topmostSubform[0].Page1[0].c1_01[1]": "2", //Button{2:Off}
		            "topmostSubform[0].Page1[0].c1_01[2]": "3", //Button{3:Off}
		            "topmostSubform[0].Page1[0].c1_01[3]": "4", //Button{4:Off}
		            "topmostSubform[0].Page1[0].c1_01[4]": "5", //Button{5:Off}
		            "topmostSubform[0].Page1[0].c1_01[5]": "6", //Button{6:Off}
		            "topmostSubform[0].Page1[0].f1_18_0_[0]": "topmostSubform[0].Page1[0].f1_18_0_[0]", //Text
		            "topmostSubform[0].Page1[0].c1_01[6]": "7", //Button{7:Off}
		            "topmostSubform[0].Page1[0].f1_50_0_[0]": "topmostSubform[0].Page1[0].f1_50_0_[0]", //Text
		            "topmostSubform[0].Page1[0].c1_01[7]": "8", //Button{8:Off}
		            "topmostSubform[0].Page1[0].f1_04_0_[0]": "topmostSubform[0].Page1[0].f1_04_0_[0]", //Text
		            "topmostSubform[0].Page1[0].f1_05_0_[0]": "topmostSubform[0].Page1[0].f1_05_0_[0]", //Text
		            "topmostSubform[0].Page1[0].f1_07_0_[0]": "topmostSubform[0].Page1[0].f1_07_0_[0]", //Text
		            "topmostSubform[0].Page1[0].social[0].TextField1[0]": "topmostSubform[0].Page1[0].social[0].TextField1[0]", //Text
		            "topmostSubform[0].Page1[0].social[0].TextField2[0]": "topmostSubform[0].Page1[0].social[0].TextField2[0]", //Text
		            "topmostSubform[0].Page1[0].social[0].TextField2[1]": "topmostSubform[0].Page1[0].social[0].TextField2[1]", //Text
		            "topmostSubform[0].Page1[0].social[0].TextField2[2]": "topmostSubform[0].Page1[0].social[0].TextField2[2]", //Text
		            "topmostSubform[0].Page1[0].social[0].TextField2[3]": "topmostSubform[0].Page1[0].social[0].TextField2[3]", //Text
		            "topmostSubform[0]": "topmostSubform[0]", //
		            "Text1": "Text1", //Text
		            "Text2": "Text2", //Text
		            "Text3": "Text3", //Text
		            "Text4": "Text4", //Text
		            "Text5": "Text5", //Text
		            "Text6": "Text6", //Text
		            "Text7": "Text7", //Text
		            "Text8": "Text8", //Text
		            "Text9": "Text9", //Text
		            "Text10": "Text10", //Text
		            "Text11": "Text11", //Text
		            "Text12": "Text12", //Text
		            "Text13": "Text13", //Text
		            "Text14": "Text14", //Text
		            "Text15": "Text15", //Text
		            "Text17": "Text17", //Text
		            "Text18": "Text18", //Text
		            "Text19": "Text19", //Text
		            "Text20": "Text20", //Text
		            "Text21": "Text21", //Text
		            "Check Box22": "Yes", //Button{Off:Yes}
		            "Check Box23": "Yes", //Button{Off:Yes}
		            "Check Box24": "Yes", //Button{Off:Yes}
		            "Check Box25": "Yes", //Button{Off:Yes}
		            "Check Box26": "Yes", //Button{Off:Yes}
		            "Text27": "Text27", //Text
		            "Text28": "Text28", //Text
		            "Text29": "Text29", //Text
		            "Text30": "Text30", //Text
		            "Text31": "Text31", //Text
		            "Text32": "Text32", //Text
		            "Text33": "Text33", //Text
		            "Text34": "Text34", //Text
		            "Text35": "Text35", //Text
		            "Text16": "Text16", //Text
		            "Text22": "Text22", //Text
		            "Text23": "Text23", //Text
		            "Text24": "Text24", //Text
		            "Text25": "Text25", //Text
		            "Text26": "Text26", //Text
		            "Text36": "Text36", //Text
		            "Text37": "Text37", //Text
		            "Text38": "Text38", //Text
		            "Text39": "Text39", //Text
		            "Text40": "Text40", //Text
		            "Text41": "Text41", //Text
		            "Text42": "Text42", //Text
		            "Text43": "Text43", //Text
		            "Text44": "Text44", //Text
		            "Text45": "Text45", //Text
		            "Text46": "Text46", //Text
		            "Text47": "Text47", //Text
		            "EMPLOYEE NAME": "EMPLOYEE NAME", //Text
		            "Text48": "Text48" //Text
		        }

				break;

			case "2":
				sourcePDF = './forms/source_forms/2.pdf';
				destinationPDF = './forms/filled_forms/2_' + userId + '.pdf';
				break;

			default:
			;
		}

		pdfFiller.fillForm(sourcePDF, destinationPDF, data, function (err) {
	        if (err) {
	            console.log("In callback (we're done).");
	            console.log("" + err.toString());
	        }

	    });

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