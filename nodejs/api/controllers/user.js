'use strict'

var User = require('../models/user');

//encrypt password
var bcrypt = require('bcrypt-nodejs');

var moment = require('moment');

var jwt = require('../services/jwt');

var fs = require('fs');

var path = require('path');

var pdfFiller = require('pdffiller');


//upload files
const IncomingForm = require('formidable').IncomingForm;

module.exports = {
	saveUser,
	loginUser,
	getUser,
	getUsers,
	updateUser,
	uploadImage,
	upload,
	getImageFile,
	fillPersonalInformation,
	fillJobInformation,
	fillUploadFiles,
	fillEmergencyInformation,
	fillahca,
	fillw9,
	getPdf,
	getPdf2
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
		//encrypt password
		return bcrypt.hash(params.password, null, null, (err, hash) => {
			if (err)
				return res.status(500).send({message: 'Error encrypting password'});
			user.password = hash;
			user.complete="";
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
				user.job_information = undefined;
				user.education_hystory = undefined;
				user.emergency_information= undefined;				
		        // user.personal_information.present_address= undefined;
		        // user.personal_information.social_security_number= undefined;
		        // user.personal_information.permanent_address_if_different= undefined;
		        // user.personal_information.phone= undefined;
				user.ahca= undefined;
				user.evidencelevel2= undefined;
				user.w9= undefined;
				

				if (check) { //return user's data

					//test
					//pdffiller(user.id);

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
		user.job_information = undefined;
		user.emergency_information= undefined;			
        // user.personal_information.present_address= undefined;
        // user.personal_information.social_security_number= undefined;
        // user.personal_information.permanent_address_if_different= undefined;
        // user.personal_information.phone= undefined;
        user.ahca= undefined;
		user.evidencelevel2= undefined;
		user.w9= undefined;
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
/*revisar esto a ver si funciona correctamente*/
function updateUser(req, res) {

	var update ={personal_information:req.body} ;

	

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
/*revisar esto a ver si funciona correctamente*/
function upload(req, res) {

	/*if ((userId = req.params.id) != req.user.sub) {
		return removeFilesOfUploads(res, file_path, 'Permission denied.');
	}*/

	var userId = req.params.id;
	var userIdDoc = req.params.id_doc
	var form = new IncomingForm();

	form.uploadDir = './uploads/users/'+userId;
	
	form.keepExtensions = true;
	 
	if(!fs.existsSync(form.uploadDir)){
		    fs.mkdirSync(form.uploadDir, function(err){
		        if(err){
		            console.log(err);
		            // echo the result back
		            response.send("ERROR! Can't make the directory! \n");
		        }
		    });
		}

	form.on('file', (name, file) => {

		var file_path = file.path;
		var file_name = file_path.substring(file_path.lastIndexOf('\\') + 1);


		console.log('fp: ' + file_path);
		console.log('fn1: ' + file_name);		
		console.log('userIdDoc: ' + userIdDoc);
		

		User.findOne({_id: userId}, (err, user) => {
			
				if (err) {
				return removeFilesOfUploads(res, file_path, 'Error updating user.');
				}
				if (!user) {
					return removeFilesOfUploads(res, file_path, 'User could not be updated.');
				}else {                       			
					switch(userIdDoc){
						case 'state_lic':user.job_information.requred_documments.state_lic=file_name;break;
						case 'proof_of_liability_insurance':user.job_information.requred_documments.proof_of_liability_insurance=file_name;break;
						case 'cpr_card':user.job_information.requred_documments.cpr_card=file_name;break;
						case 'hiv_aids':user.job_information.requred_documments.hiv_aids=file_name;break;
						case 'osha':user.job_information.requred_documments.osha=file_name;break;
						case 'dom_violence':user.job_information.requred_documments.dom_violence=file_name;break;
						case 'driver_lic':user.job_information.requred_documments.driver_lic=file_name;break;
						case 'auto_insurance':user.job_information.requred_documments.auto_insurance=file_name;break;
						case 'residency':user.job_information.requred_documments.residency=file_name;break;
						case 'ssc':user.job_information.requred_documments.ssc=file_name;break;
						case 'physical_exam':user.job_information.requred_documments.physical_exam=file_name;break;
						case 'pdfresume':user.job_information.employment_history.resume=file_name;break;
					}     
                            return user.save((err2, userStored) => {
                                if (err2) {
                                	console.log("ok err");
                                    return res.status(200).send({message: "Error al guardar el formulario de documentos nesesarios",next:false});
                                }
                                if (!userStored) { //success
	                                console.log("ok err2");
	                                return res.status(404).send({message: 'El formulario de documentos nesesarios no ha sido guardado',next:false});
                                }
                                
                            });
                   }
              
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

//create the new intance of pdf3
function fillPersonalInformation(req, res) {	

        var params = req.body;

        User.findOne({_id: req.user.sub}, (err, user) => {

                if(err) return res.status(500).send({message: 'Error in the request of form.',next:false});
                if (!user) {
                	console.log("err");
                      return  res.status(500).send({message: 'Error el usuario no existe.',next:false});
                }else {
                        //if(user.complete!="") return  res.status(500).send({message: 'Error el usuario ya lleno  la informacion personal.'});

						console.log("ok");
						/*
							params.name &&
                        	params.last_Name &&
                        	params.mi &&
                            params.social_security_number &&
                            params.present_address &&
                            params.date_of_birthday &&
                            params.gender
						*/
                        if (true){

							console.log("ok if");
                            user.user_id = req.user.sub;	
                            user.last_change = moment().unix();
                            user.complete=0;
                            user.personal_information.name = params.name;
                            user.personal_information.last_Name = params.last_Name;
                            user.personal_information.mi = params.mi==undefined? '':params.mi;
                            user.personal_information.social_security_number = params.social_security_number;
                            user.personal_information.present_address = params.present_address;
                            user.personal_information.city = params.city;
                            user.personal_information.state = params.state;
                            user.personal_information.zip_code = params.zip_code;                            
                            user.personal_information.phone = params.phone;
                            user.personal_information.date_of_birthday = params.date_of_birthday;
                            user.personal_information.gender = params.gender;

                            if (params.permanent_address_if_different!=undefined) {
                            	user.personal_information.permanent_address_if_different = params.permanent_address_if_different
	                            user.personal_information.city_if_different = params.city2;
	                            user.personal_information.state_if_different = params.state2;
	                            user.personal_information.zip_code_if_different = params.zip_code2;
                            };
                            
                            return user.save((err2, userStored) => {
                                if (err2) {
                                	console.log("ok err");
                                    return res.status(200).send({message: "Error al guardar el formulario de informacion personal",next:false});
                                }
                                if (userStored) { //success
                                	console.log("ok saved");
                                    return res.status(200).send({message: "El formulario de informacion personal se ha llenado correctamente ",next:true});
                                }
                                console.log("ok err2");
                                return res.status(404).send({message: 'El formulario de informacion personal no ha sido guardado',next:false});
                            });
                        }
                      }
        });

}


//create the new intance of pdf3
function fillJobInformation(req, res) {

        var params = req.body;

        User.findOne({_id: req.user.sub}, (err, user) => {

                if(err) return res.status(500).send({message: 'Error in the request of form.',next:false});
                if (!user) {
                      return  res.status(500).send({message: 'Error el usuario no existe.',next:false});
                }else {
                        //if(user.complete!="") return  res.status(500).send({message: 'Error el usuario ya lleno  la informacion personal.'});
                        	/*
    	   		
                        	*/

                        if (true){

                            user.user_id = req.user.sub;
                            user.last_change = moment().unix();
                            user.complete++ ;

                            user.job_information.applaying_job=params.applaying_job;



					    	
					    	//job_information.requred_documments: [String], documentos a subir


					    	console.log("lvevels");
					    	if (params.lv1_name_of_school) {
					    		       
					    		console.log("lv1");

					    		
					    		user.job_information.education_information.lv1.name=params.lv1_name_of_school;
					    		user.job_information.education_information.lv1.address=params.lv1_address;
					    		user.job_information.education_information.lv1.city=params.lv1_city;
					    		user.job_information.education_information.lv1.state=params.lv1_state
					    		user.job_information.education_information.lv1.zipcode=params.lv1_zipcode
								user.job_information.education_information.lv1.years_attended=params.lv1_years_attended;
								user.job_information.education_information.lv1.subject_studied=params.lv1_subject_studied;

								if (params.lv2_name_of_school) {
									console.log("lv2");

									user.job_information.education_information.lv2.name=params.lv2_name_of_school;
					    			user.job_information.education_information.lv2.address=params.lv2_address;
					    			user.job_information.education_information.lv2.city=params.lv2_city;
					    			user.job_information.education_information.lv2.state=params.lv2_state
					    			user.job_information.education_information.lv2.zipcode=params.lv2_zipcode
									user.job_information.education_information.lv2.years_attended=params.lv2_years_attended;
									user.job_information.education_information.lv2.subject_studied=params.lv2_subject_studied;

									if (params.lv3_name_of_school) {

										user.job_information.education_information.lv3.name=params.lv3_name_of_school;
					    				user.job_information.education_information.lv3.address=params.lv3_address;
					    				user.job_information.education_information.lv3.city=params.lv3_city;
					    				user.job_information.education_information.lv3.state=params.lv3_state
					    				user.job_information.education_information.lv3.zipcode=params.lv3_zipcode
										user.job_information.education_information.lv3.years_attended=params.lv3_years_attended;
										user.job_information.education_information.lv3.subject_studied=params.lv3_subject_studied;

											if (params.lv4_name_of_school) {

												user.job_information.education_information.lv4.name=params.lv4_name_of_school;
					    						user.job_information.education_information.lv4.address=params.lv4_address;
					    						user.job_information.education_information.lv4.city=params.lv4_city;
					    						user.job_information.education_information.lv4.state=params.lv4_state
					    						user.job_information.education_information.lv4.zipcode=params.lv4_zipcode
												user.job_information.education_information.lv4.years_attended=params.lv4_years_attended;
												user.job_information.education_information.lv4.subject_studied=params.lv4_subject_studied;


											}

									}

								}

								
					    	} 

					    	
					    	if (!params.resume) {	

					    			if (params.work1_from) {						
							    	
								    	user.job_information.employment_history.data.work1.from=params.work1_from.toString().split("T")[0];
										user.job_information.employment_history.data.work1.to=params.work1_to.toString().split("T")[0];
										user.job_information.employment_history.data.work1.name_of_employer=params.work1_name_of_employer;
										user.job_information.employment_history.data.work1.address=params.work1_address;
										user.job_information.employment_history.data.work1.city=params.work1_city;
										user.job_information.employment_history.data.work1.state=params.work1_state;
										user.job_information.employment_history.data.work1.zipcode=params.work1_zipcode;
										user.job_information.employment_history.data.work1.position=params.work1_position;
										user.job_information.employment_history.data.work1.reason_for_leaving=params.work1_reason_for_leaving;
										user.job_information.employment_history.data.work1.attention=params.work1_attention?params.work1_attention:"";
										user.job_information.employment_history.data.work1.phone=params.work1_phone?params.work1_phone:"";
										user.job_information.employment_history.data.work1.fax=params.work1_fax?params.work1_fax:"";
										
										if (params.work2_from) {

											user.job_information.employment_history.data.work2.from=params.work2_from.toString().split("T")[0];
											user.job_information.employment_history.data.work2.to=params.work2_to.toString().split("T")[0];
											user.job_information.employment_history.data.work2.name_of_employer=params.work2_name_of_employer;
											user.job_information.employment_history.data.work2.address=params.work2_address;
											user.job_information.employment_history.data.work2.city=params.work2_city;
											user.job_information.employment_history.data.work2.state=params.work2_state;
											user.job_information.employment_history.data.work2.zipcode=params.work2_zipcode;
											user.job_information.employment_history.data.work2.position=params.work2_position;
											user.job_information.employment_history.data.work2.reason_for_leaving=params.work2_reason_for_leaving;
											user.job_information.employment_history.data.work2.attention=params.work2_attention?params.work2_attention:"";
											user.job_information.employment_history.data.work2.phone=params.work2_phone?params.work2_phone:"";
											user.job_information.employment_history.data.work2.fax=params.work2_fax?params.work2_fax:"";
										
											if (params.work3_from) {

												user.job_information.employment_history.data.work3.from=params.work3_from.toString().split("T")[0],
												user.job_information.employment_history.data.work3.to=params.work3_to.toString().split("T")[0];
												user.job_information.employment_history.data.work3.name_of_employer=params.work3_name_of_employer;
												user.job_information.employment_history.data.work3.address=params.work3_address;
												user.job_information.employment_history.data.work3.city=params.work3_city;
												user.job_information.employment_history.data.work3.state=params.work3_state;
												user.job_information.employment_history.data.work3.zipcode=params.work3_zipcode;
												user.job_information.employment_history.data.work3.position=params.work3_position;
												user.job_information.employment_history.data.work3.reason_for_leaving=params.work3_reason_for_leaving;
												user.job_information.employment_history.data.work3.attention=params.work3_attention?params.work3_attention:"";
												user.job_information.employment_history.data.work3.phone=params.work3_phone?params.work3_phone:"";
												user.job_information.employment_history.data.work3.fax=params.work3_fax?params.work3_fax:"";
										
											}

										}
									}

							
					                            
					        }

                            return user.save((err2, userStored) => {
                                if (err2) {
                                    return res.status(200).send({message: "Error al guardar el formulario de informacion personal",next:false});
                                }
                                if (userStored) { //success
                                    return res.status(200).send({message: "El formulario de informacion personal se ha llenado correctamente ",next:true});
                                }
                                return res.status(404).send({message: 'El formulario de informacion personal no ha sido guardado',next:false});
                            });
                        }
                      }
        });

}

function fillUploadFiles(req, res) {

        var params = req.body;

        User.findOne({_id: req.user.sub}, (err, user) => {

                if(err) return res.status(500).send({message: 'Error in the request of form.',next:false});
                if (!user) {
                      return  res.status(500).send({message: 'Error el usuario no existe.',next:false});
                }else {
                        //if(user.complete!="") return  res.status(500).send({message: 'Error el usuario ya lleno  la informacion personal.'});
                        	/*
    	   		
                        	*/

                        if (true){

                           
                            user.last_change = moment().unix();
                            user.complete++ ;                   
					                            
					        

                            return user.save((err2, userStored) => {
                                if (err2) {
                                    return res.status(200).send({message: "Error al guardar el formulario de UploadFiles",next:false});
                                }
                                if (userStored) { //success
                                    return res.status(200).send({message: "El formulario de UploadFiles se ha llenado correctamente ",next:true});
                                }
                                return res.status(404).send({message: 'El formulario de UploadFiles no ha sido guardado',next:false});
                            });
                        }
                        return res.status(404).send({message: 'El formulario de UploadFiles no ha sido guardado',next:false});
                    }
                      
        });

}


//create the new intance of pdf3
function fillEmergencyInformation(req, res) {
        
        var params = req.body;
         console.log(params);

        User.findOne({_id: req.user.sub}, (err, user) => {
                if (err) return res.status(500).send({message: 'Error in the request of fillEmergencyInformation.',next:false});
                if (!user) {
                        return res.status(500).send({message: 'el usuario no existe.',next:false});
                } else {               

                 if (
                 	 params.contact_emergency_name &&
                 	 params.contact_emergency_last_name && 
                     params.contact_emergency_relationship &&
                     params.contact_emergency_address &&
                     params.contact_emergency_city &&
                     params.contact_emergency_state &&
                     params.contact_emergency_zip_code &&
                     params.contact_emergency_phone &&
                     params.contact_emergency_name2 &&
                 	 params.contact_emergency_last_name2 && 
                     params.contact_emergency_relationship2 &&
                     params.contact_emergency_address &&
                     params.contact_emergency_city2 &&
                     params.contact_emergency_state2 &&
                     params.contact_emergency_zip_code2 &&
                     params.contact_emergency_phone2
                     )
                  {
                     user.last_change = moment().unix();
                     user.complete++;

                     user.emergency_information.contact_primary.name=params.contact_emergency_name;
                     user.emergency_information.contact_primary.last_Name=params.contact_emergency_last_name;
			         user.emergency_information.contact_primary.relationship=params.contact_emergency_relationship;
			         user.emergency_information.contact_primary.address=params.contact_emergency_address;
			         user.emergency_information.contact_primary.city=params.contact_emergency_city;
			         user.emergency_information.contact_primary.state=params.contact_emergency_state;
			         user.emergency_information.contact_primary.zipcode=params.contact_emergency_zip_code;
			         user.emergency_information.contact_primary.telephone=params.contact_emergency_phone;
			         
			         	 user.emergency_information.contact_secondary.name=params.contact_emergency_name2;
			         	 user.emergency_information.contact_secondary.last_Name=params.contact_emergency_last_name2;
				         user.emergency_information.contact_secondary.relationship=params.contact_emergency_relationship2;
				         user.emergency_information.contact_secondary.address=params.contact_emergency_address2;
				         user.emergency_information.contact_secondary.city=params.contact_emergency_city2;
				         user.emergency_information.contact_secondary.state=params.contact_emergency_state2;
				         user.emergency_information.contact_secondary.zipcode=params.contact_emergency_zip_code2;
				         user.emergency_information.contact_secondary.telephone=params.contact_emergency_phone2;

				         if (params.contact_emergency_mi) {
 							user.emergency_information.contact_primary.mi=params.contact_emergency_mi;
				         } 
				         if (params.contact_emergency_mi2) {
 							user.emergency_information.contact_secondary.mi=params.contact_emergency_mi2;
				         } 

			         
                      return user.save((err2, userStored) => {
                         if (err2) {
                             return res.status(200).send({message: "Error al guardar el formulario del EmergencyInformation ",next:false});
                         }
                         if (userStored) { //success
                             return res.status(200).send({message: "El formulario EmergencyInformation se ha llenado correctamente ",next:true});
                         }
                         return res.status(404).send({message: 'el formulario no ha sido guardado', next:false});
                     });
                 }

                 return res.status(500).send({message: 'Error:verifique que todos los campos esten llenos y que sean los correctos.',next:false});

           }
      });

}



function fillahca(req, res) {
        
        var params = req.body;
         
        User.findOne({_id: req.user.sub}, (err, user) => {
                if (err) return res.status(500).send({message: 'Error in the request of fillahca.',next:false});
                if (!user) {
                        return res.status(500).send({message: 'el usuario no existe.',next:false});
                } else {               

                 if (
                 	params.ahca_name &&
					params.ahca_last_name &&
					params.ahca_address &&
					params.ahca_city &&
					params.ahca_state &&
					params.ahca_zip_code									
                    )
                  {
                     user.last_change = moment().unix();
                     user.complete++;

                     user.ahca.name=params.ahca_name;
                     user.ahca.last_Name=params.ahca_last_name;
			         user.ahca.address=params.ahca_address;
			         user.ahca.city=params.ahca_city;
			         user.ahca.state=params.ahca_state;
			         user.ahca.zipcode=params.ahca_zip_code;
			         if (params.ahca_mi) {
							user.ahca.mi=params.ahca_mi;
			         } 
					 
					 
					if(params.evidencelevel2){
						user.evidencelevel2.purpose=params.evidencelevel2_purpose;
						user.evidencelevel2.date=params.evidencelevel2_date.toString().split("T")[0];;
						user.evidencelevel2.agencyhealthcareadministration=params.evidencelevel2_agencyhealthcareadministration?'Yes':'Off';
						user.evidencelevel2.departmenthealth=params.evidencelevel2_departmenthealth?'Yes':'Off';
						user.evidencelevel2.agencypersonswithdisabilities=params.evidencelevel2_agencypersonswithdisabilities?'Yes':'Off';
						user.evidencelevel2.departmentchildrenfamilyservices=params.evidencelevel2_departmentchildrenfamilyservices?'Yes':'Off';
						user.evidencelevel2.departmentfinancialservices=params.evidencelevel2_departmentfinancialservices?'Yes':'Off';
					}			    	
			         
                      return user.save((err2, userStored) => {
                         if (err2) {
                             return res.status(200).send({message: "Error al guardar el formulario del ahca ",next:false});
                         }
                         if (userStored) { //success
                             return res.status(200).send({message: "El formulario ahca se ha llenado correctamente ",next:true});
                         }
                         return res.status(404).send({message: 'el formulario no ha sido guardado', next:false});
                     });
                 }

                 return res.status(500).send({message: 'Error:verifique que todos los campos esten llenos y que sean los correctos.',next:false});

           }
      });

}


function fillw9(req, res) {
        
        var params = req.body;
         
        User.findOne({_id: req.user.sub}, (err, user) => {
                if (err) return res.status(500).send({message: 'Error in the request of fillw9.',next:false});
                if (!user) {
                        return res.status(500).send({message: 'el usuario no existe.',next:false});
                } else {               

                 if (					
					params.w9_name &&
					params.w9_address &&
					params.w9_city &&
					params.w9_state &&
					params.w9_zipcode 					
                     )
                  {
                     user.last_change = moment().unix();
                     user.complete++;
                    

			    	user.w9.name=params.w9_name;
			    	if (params.w9_business) {
			    		user.w9.business=params.w9_business;
			    	}			    	
			    	user.w9.address=params.w9_address;
			        user.w9.city=params.w9_city;
					user.w9.state=params.w9_state;
					user.w9.zipcode=params.w9_zipcode;

					user.w9.exemptpayee=params.w9_exemptpayee?'8':'Off';

					if (params.w9_exemptpayee){

						user.w9.individual='Off';
				    	user.w9.ccorporation='Off';
				    	user.w9.scorporation='Off';
				    	user.w9.partnership='Off';
				    	user.w9.trust='Off';
				    	user.w9.limited='Off';
				    	user.w9.other='Off';	

					}else {
						user.w9.individual=params.w9_individual?'1':'Off';
				    	user.w9.ccorporation=params.w9_ccorporation?'2':'Off';
				    	user.w9.scorporation=params.w9_scorporation?'3':'Off';
				    	user.w9.partnership=params.w9_partnership?'4':'Off';
				    	user.w9.trust=params.w9_trust?'5':'Off';

				    	user.w9.limited=params.w9_limited?'6':'Off';
				    	if (params.w9_limited) {
				    		user.w9.classification=params.w9_classification;
				    	}
				    	
				    	user.w9.other=params.w9_other?'7':'Off';				    	
				    	if (params.w9_other) {
				    		user.w9.othert=params.w9_othert;
				    	}
			    	}
											
				    	

			    	 

			    	if (params.w9_listaccountnumber) {
			    		user.w9.listaccountnumber=params.w9_listaccountnumber;
			    	}



				         

			         
                      return user.save((err2, userStored) => {
                         if (err2) {
                             return res.status(200).send({message: "Error al guardar el formulario del w9 ",next:false});
                         }
                         if (userStored) { //success
                             return res.status(200).send({message: "El formulario w9 se ha llenado correctamente ",next:true});
                         }
                         return res.status(404).send({message: 'el formulario no ha sido guardado', next:false});
                     });
                 }

                 return res.status(500).send({message: 'Error:verifique que todos los campos esten llenos y que sean los correctos.',next:false});

           }
      });

}




function getPdf(req,res){

  //var user_id = req.user.sub;
  var params=req.body;
  console.log("parametros ");
  console.log(params);
  console.log("datos usuarios ");
  console.log(req.user);
   var user_id = req.user.sub;
   
  var pdf_file = params.pdfselected;//'3';
  var path_file = ('./forms/filled_forms/'+user_id+'_'+ pdf_file+'.pdf');
  var sourcePDF = ('./forms/source_forms/'+pdf_file+'.pdf');
  var data=null;


  User.findOne({_id: user_id}, (err, user) => {
      if (err) return  res.status(500).send({message: 'Error in the find of pdf3.'});
      if (user) {

      		switch(pdf_file){
      			//default :data=data3(user);break;
      			case '3':data=data3(user);break;
      			default: return  res.status(500).send({message: 'Error el pdf '+pdf_file+' no existe.'});
      		}

  		     //si es false devuelve los campos editables, si es true  los devuelve como campos no editables 
          var shouldFlatten=true;
          /*esta funcion permite exportar 
          solo los campos que creas neseasrios 
          para el pdf y no todos como era con fillForm*/
          console.log("ini "+__dirname );
          console.log(sourcePDF+'\n'+ path_file+'\n'+  data+'\n'+ shouldFlatten);
           pdfFiller.fillFormWithFlatten(sourcePDF, path_file, data,shouldFlatten, function (err2) {
              if (err) return  res.status(500).send({message: 'Error in the pdffiller of pdf3.'});
              fs.exists(path_file, (exists) => {
                 if (exists) {
                 			  //res.contentType("application/pdf");
                     //return   res.sendFile(path.resolve(path_file));
           
				    console.log('Archivo creado satisfactoriamente ....');
		            var enviar = fs.readFileSync(path_file, 'binary');
		            res.setHeader('Content-Length', enviar.length);
		            res.write(enviar, 'binary');
		            res.end();
		            console.log('Archivo enviado satisfactoriamente ....');
		            console.log(res);


                 } else {
                     return   res.status(200).send({message: 'Pdf3  not exist'});
                 }
              });
           });

      } else{
         return  res.status(500).send({message: 'Error el usuario no existe.'});
      }

  });
} 



function data3(user){
	/*console.log('personal_information:'+JSON.stringify(user.personal_information));
	console.log('job_information:'+JSON.stringify(user.job_information));
	console.log('emergency_information:'+JSON.stringify(user.emergency_information));
	console.log('ahca:'+JSON.stringify(user.ahca));
	console.log('evidencelevel2:'+JSON.stringify(user.evidencelevel2));
	console.log('w9:'+JSON.stringify(user.w9));*/
	
	let ji='{"education_information":{"lv1":{},"lv2":{},"lv3":{},"lv4":{}},"employment_history":{"data":{"work1":{},"work2":{},"work3":{}}},"requred_documments":[]}';
	let ei='{"contact_primary":{},"contact_secondary":{}}';

	return {  
				"NAME": JSON.stringify(user.personal_information) === '{}'? ' ': (user.personal_information.name+' '+(user.personal_information.mi == undefined  ? ' ' :user.personal_information.mi )+' '+user.personal_information.last_Name),
				"SOCIAL SECURITY NUMBER": JSON.stringify(user.personal_information) === '{}'? ' ':(user.personal_information.social_security_number),
				"PRESENT ADDRESS": JSON.stringify(user.personal_information) === '{}'? ' ': (user.personal_information.present_address+',  '+user.personal_information.city+', '+user.personal_information.state+', '+user.personal_information.zip_code),
				"PERMANENT ADDRESS IF DIFFERENT":JSON.stringify(user.personal_information) === '{}'? ' ': (user.personal_information.permanent_address_if_different == undefined ? ' ' :(user.personal_information.permanent_address_if_different+', '+user.personal_information.city_if_different+', '+user.personal_information.state_if_different+', '+user.personal_information.zipcode_if_different)),
				"PHONE": JSON.stringify(user.personal_information) === '{}'? ' ': ( user.personal_information.phone),
				"REFERRED BY":JSON.stringify(user.personal_information) === '{}'? ' ': (user.personal_information.referredby == undefined ? '' : user.personal_information.referredby),
				"NAME  LOCATION OF SCHOOLGRAMMAR SCHOOL":JSON.stringify(user.job_information) === ji? ' ': ( user.job_information.education_information.lv1.name == undefined  ? ' ' :  (user.job_information.education_information.lv1.name+' in '+user.job_information.education_information.lv1.address+', '+user.job_information.education_information.lv1.city+', '+user.job_information.education_information.lv1.state+', '+user.job_information.education_information.lv1.zipcode)),
				"YEARS ATTENDEDGRAMMAR SCHOOL":JSON.stringify(user.job_information) === ji? ' ': (user.job_information.education_information.lv1.years_attended == undefined ? ' ' : user.job_information.education_information.lv1.years_attended),
				"SUBJECT STUDIEDGRAMMAR SCHOOL":JSON.stringify(user.job_information) === ji? ' ': (user.job_information.education_information.lv1.subject_studied == undefined ? ' ' : user.job_information.education_information.lv1.subject_studied),
				"NAME  LOCATION OF SCHOOLHIGH SCHOOL":JSON.stringify(user.job_information) === ji? ' ': (user.job_information.education_information.lv2.name == undefined ? ' ' :  (user.job_information.education_information.lv2.name+' in '+user.job_information.education_information.lv2.address+', '+user.job_information.education_information.lv2.city+', '+user.job_information.education_information.lv2.state+', '+user.job_information.education_information.lv2.zipcode)),
				"YEARS ATTENDEDHIGH SCHOOL":JSON.stringify(user.job_information) === ji? ' ': (user.job_information.education_information.lv2.years_attended == undefined ? ' ' : user.job_information.education_information.lv2.years_attended),
				"SUBJECT STUDIEDHIGH SCHOOL":JSON.stringify(user.job_information) === ji? ' ': (user.job_information.education_information.lv2.subject_studied == undefined ? ' ' : user.job_information.education_information.lv2.subject_studied),
				"NAME  LOCATION OF SCHOOLCOLLEGE":JSON.stringify(user.job_information) === ji? ' ': (user.job_information.education_information.lv3.name == undefined ? ' ' :  (user.job_information.education_information.lv3.name+' in '+user.job_information.education_information.lv3.address+', '+user.job_information.education_information.lv3.city+', '+user.job_information.education_information.lv3.state+', '+user.job_information.education_information.lv3.zipcode)),
				"YEARS ATTENDEDCOLLEGE":JSON.stringify(user.job_information) === ji? ' ': (user.job_information.education_information.lv3.years_attended == undefined ? ' ' : user.job_information.education_information.lv3.years_attended),
				"SUBJECT STUDIEDCOLLEGE":JSON.stringify(user.job_information) === ji? ' ': (user.job_information.education_information.lv3.subject_studied == undefined ? ' ' : user.job_information.education_information.lv3.subject_studied),
				"NAME  LOCATION OF SCHOOLTRADE OTHER SCHOOL":JSON.stringify(user.job_information) === ji? ' ': (user.job_information.education_information.lv4.name == undefined ? ' ' :  (user.job_information.education_information.lv4.name+' in '+user.job_information.education_information.lv4.address+', '+user.job_information.education_information.lv4.city+', '+user.job_information.education_information.lv4.state+', '+user.job_information.education_information.lv4.zipcode)),
				"YEARS ATTENDEDTRADE OTHER SCHOOL":JSON.stringify(user.job_information) === ji? ' ': (user.job_information.education_information.lv4.years_attended == undefined ? ' ' : user.job_information.education_information.lv4.years_attended),
				"SUBJECT STUDIEDTRADE OTHER SCHOOL":JSON.stringify(user.job_information) === ji? ' ': (user.job_information.education_information.lv4.subject_studied == undefined ? ' ' : user.job_information.education_information.lv4.subject_studied),
				"FROM TORow1":JSON.stringify(user.job_information) === ji? ' ': (user.job_information.employment_history.data.work1.from == undefined ? ' ' :(user.job_information.employment_history.data.work1.from +' to '+user.job_information.employment_history.data.work1.to)),
				"NAME  LOCATION OF EMPLOYERRow1":JSON.stringify(user.job_information) === ji? ' ': (user.job_information.employment_history.data.work1.name_of_employer == undefined ? ' ' :(user.job_information.employment_history.data.work1.name_of_employer+' in '+user.job_information.employment_history.data.work1.address+', '+user.job_information.employment_history.data.work1.city+', '+user.job_information.employment_history.data.work1.state+', '+user.job_information.employment_history.data.work1.zipcode)),
				"POSITIONRow1":JSON.stringify(user.job_information) === ji? ' ': (user.job_information.employment_history.data.work1.position == undefined ? ' ' : user.job_information.employment_history.data.work1.position),
				"REASON FOR LEAVINGRow1":JSON.stringify(user.job_information) === ji? ' ': (user.job_information.employment_history.data.work1.reason_for_leaving == undefined ? ' ' : user.job_information.employment_history.data.work1.reason_for_leaving),
				"FROM TORow2":JSON.stringify(user.job_information) === ji? ' ': (user.job_information.employment_history.data.work2.from == undefined ? ' ' :(user.job_information.employment_history.data.work2.from+' to '+user.job_information.employment_history.data.work2.to)),
				"NAME  LOCATION OF EMPLOYERRow2":JSON.stringify(user.job_information) === ji? ' ': (user.job_information.employment_history.data.work2.name_of_employer == undefined ? ' ' :(user.job_information.employment_history.data.work2.name_of_employer+' in '+user.job_information.employment_history.data.work2.address+', '+user.job_information.employment_history.data.work2.city+', '+user.job_information.employment_history.data.work2.state+', '+user.job_information.employment_history.data.work2.zipcode)),
				"POSITIONRow2":JSON.stringify(user.job_information) === ji? ' ': (user.job_information.employment_history.data.work2.position == undefined ? ' ' : user.job_information.employment_history.data.work2.position),
				"REASON FOR LEAVINGRow2":JSON.stringify(user.job_information) === ji? ' ': (user.job_information.employment_history.data.work2.reason_for_leaving == undefined ? ' ' : user.job_information.employment_history.data.work2.reason_for_leaving),
				"FROM TORow3":JSON.stringify(user.job_information) === ji? ' ': (user.job_information.employment_history.data.work3.from == undefined ? ' ' : (user.job_information.employment_history.data.work3.from+' to '+user.job_information.employment_history.data.work3.to)),
				"NAME  LOCATION OF EMPLOYERRow3":JSON.stringify(user.job_information) === ji? ' ': (user.job_information.employment_history.data.work3.name_of_employer == undefined ? ' ' : (user.job_information.employment_history.data.work3.name_of_employer+' in '+user.job_information.employment_history.data.work3.address+', '+user.job_information.employment_history.data.work3.city+', '+user.job_information.employment_history.data.work3.state+', '+user.job_information.employment_history.data.work3.zipcode)),
				"POSITIONRow3":JSON.stringify(user.job_information) === ji? ' ': (user.job_information.employment_history.data.work3.position == undefined ? ' ' : user.job_information.employment_history.data.work3.position),
				"REASON FOR LEAVINGRow3":JSON.stringify(user.job_information) === ji? ' ': (user.job_information.employment_history.data.work3.reason_for_leaving == undefined ? ' ' :user.job_information.employment_history.data.work3.reason_for_leaving),
				"NAME_2":  JSON.stringify(user.emergency_information) === ei? ' ':  (user.emergency_information.contact_primary.name+' '+(user.emergency_information.contact_primary.mi== undefined ? ' ' :user.emergency_information.contact_primary.mi)+' '+user.emergency_information.contact_primary.last_Name),
				"RELATIONSHIP":  JSON.stringify(user.emergency_information) === ei? ' ':  (user.emergency_information.contact_primary.relationship),
				"ADDRESS": JSON.stringify(user.emergency_information) === ei? ' ':  (user.emergency_information.contact_primary.address), 
				"CITY": JSON.stringify(user.emergency_information) === ei? ' ':  (user.emergency_information.contact_primary.city),
				"STATE": JSON.stringify(user.emergency_information) === ei? ' ':   (user.emergency_information.contact_primary.state),
				"ZIP CODE": JSON.stringify(user.emergency_information) === ei ?' ':   (user.emergency_information.contact_primary.zipcode),
				"AREA CODE AND TELEPHONE": JSON.stringify(user.emergency_information) === ei? ' ':   (user.emergency_information.contact_primary.telephone.substring(0,3)),
				"undefined":  JSON.stringify(user.emergency_information) === ei? ' ':  (user.emergency_information.contact_primary.telephone.substring(3)),
				"NAME_3":  JSON.stringify(user.emergency_information) === ei? ' ':  (user.emergency_information.contact_secondary.name+' '+(user.emergency_information.contact_secondary.mi== undefined ? ' ' :user.emergency_information.contact_secondary.mi)+' '+user.emergency_information.contact_secondary.last_Name),
				"RELATIONSHIP_2":  JSON.stringify(user.emergency_information) === ei? ' ':  (user.emergency_information.contact_secondary.relationship),
				"ADDRESS_2":  JSON.stringify(user.emergency_information) === ei? ' ':  (user.emergency_information.contact_secondary.address),
				"CITY_2": JSON.stringify(user.emergency_information) === ei? ' ':  ( user.emergency_information.contact_secondary.city),
				"STATE_2": JSON.stringify(user.emergency_information) === ei? ' ':  ( user.emergency_information.contact_secondary.state),
				"ZIP CODE_2": JSON.stringify(user.emergency_information) === ei? ' ':  ( user.emergency_information.contact_secondary.zipcode),
				"AREA CODE AND TELEPHONE_2":  JSON.stringify(user.emergency_information) === ei? ' ': ( user.emergency_information.contact_secondary.telephone.substring(0,3)),
				"undefined_2":  JSON.stringify(user.emergency_information) === ei? ' ': ( user.emergency_information.contact_secondary.telephone.substring(3)),			
				"SUBJECTS OF SPECIAL STUDY SPECIAL TRAINING US MILITARY OR NAVAL SERVICERow1":"SUBJECTS OF SPECIAL STUDY SPECIAL TRAINING US MILITARY OR NAVAL SERVICERow1",//Text
				//"DATE":"DATE",//Text
				//"SIGNATURE":"SIGNATURE",
				//"INTERVIEWED BY":"INTERVIEWED BY",//Text
				//"DATE_2":"DATE_2",//Text
				//"DA TE":"DA TE",//Text
				"I": JSON.stringify(user.personal_information) === '{}'? ' ': ( user.personal_information.name+' '+(user.personal_information.mi == undefined  ? ' ' :user.personal_information.mi )+' '+user.personal_information.last_Name),//Tex)t
				"EMPLOYEE SIGNATURE":"EMPLOYEE SIGNATURE",//Text
				"EMPLOYEE NAME_2": JSON.stringify(user.personal_information) === '{}'? ' ': ( user.personal_information.name+'  '+(user.personal_information.mi == undefined  ? ' ' :user.personal_information.mi )+' '+user.personal_information.last_Name),//Tex)t
				//"DA TE_2":"DA TE_2",//Text
				//"ADMINISTRATOR Signature":"ADMINISTRATOR Signature",//Signature
				//"EMPLOYEE SIGNATURE_2":"EMPLOYEE SIGNATURE_2",//Text
				"EMPLOYEE NAME_3": JSON.stringify(user.personal_information) === '{}'? ' ': ( user.personal_information.name+' '+(user.personal_information.mi == undefined  ? ' ' :user.personal_information.mi )+' '+user.personal_information.last_Name),//Tex)t
				//"DA TE_3":"DA TE_3",//Text
				//"EMPLOYEE SIGNATURE_3":"",//Text
				"EMPLOYEE NAME_4": JSON.stringify(user.personal_information) === '{}'? ' ': ( user.personal_information.name+' '+(user.personal_information.mi == undefined  ? ' ' :user.personal_information.mi )+' '+user.personal_information.last_Name),//Tex)t
				//"DA TE_4":"DA TE_4",//Text
				//"EMPLOYEE SIGNATURE_4":"EMPLOYEE SIGNATURE_4",//Text
				//"Employee Signature":"Employee Signature",//Signature
				//"Date":"Date",//Text
			    "topmostSubform[0].Page1[0].f1_01_0_[0]":user.w9.name==undefined?'':user.w9.name,//Text
				"topmostSubform[0].Page1[0].f1_02_0_[0]":user.w9.business==undefined?'':user.w9.business,//Text
				"topmostSubform[0].Page1[0].c1_01[0]":user.w9.individual== undefined?'Off':user.w9.individual,//Button{1:Off}
				"topmostSubform[0].Page1[0].c1_01[1]":user.w9.ccorporation== undefined?'Off':user.w9.ccorporation,//Button{2:Off}
				"topmostSubform[0].Page1[0].c1_01[2]":user.w9.scorporation== undefined?'Off':user.w9.scorporation,//Button{3:Off}
				"topmostSubform[0].Page1[0].c1_01[3]":user.w9.partnership== undefined?'Off':user.w9.partnership,//Button{4:Off}
				"topmostSubform[0].Page1[0].c1_01[4]":user.w9.trust== undefined?'Off':user.w9.trust,//Button{5:Off}
				"topmostSubform[0].Page1[0].c1_01[5]":user.w9.limited== undefined?'Off':user.w9.limited,//Button{6:Off}
				"topmostSubform[0].Page1[0].f1_18_0_[0]":user.w9.classification== undefined?'': user.w9.classification,//Text
				"topmostSubform[0].Page1[0].c1_01[6]":user.w9.other==undefined?'Off':user.w9.other,//Button{7:Off}
				"topmostSubform[0].Page1[0].f1_50_0_[0]":user.w9.othert==undefined?'':user.w9.othert,//Text
				"topmostSubform[0].Page1[0].c1_01[7]":user.w9.exemptpayee==undefined?'Off':user.w9.exemptpayee,//Button{8:Off}
				"topmostSubform[0].Page1[0].f1_04_0_[0]":user.w9.address==undefined?'':user.w9.address,//Text
				"topmostSubform[0].Page1[0].f1_05_0_[0]":user.w9.address==undefined?'':(user.w9.city+' ,'+user.w9.state+' ,'+user.w9.zipcode),//Text
				"topmostSubform[0].Page1[0].f1_07_0_[0]":user.w9.listaccountnumber==undefined?'':user.w9.listaccountnumber,//Text
				"topmostSubform[0].Page1[0].social[0].TextField1[0]":user.personal_information.social_security_number==undefined?'':user.personal_information.social_security_number.substring(0,3),//Text
				"topmostSubform[0].Page1[0].social[0].TextField2[0]":user.personal_information.social_security_number==undefined?'':user.personal_information.social_security_number.substring(3,5),//Text
				"topmostSubform[0].Page1[0].social[0].TextField2[1]":user.personal_information.social_security_number==undefined?'':user.personal_information.social_security_number.substring(5,9),//Text
				"topmostSubform[0].Page1[0].social[0].TextField2[2]":user.w9.number==undefined?'':user.w9.number.substring(0,2),//Text//mumber employer .substring(0,2)
				"topmostSubform[0].Page1[0].social[0].TextField2[3]":user.w9.number==undefined?'':user.w9.number.substring(2,9),//Text   				.substring(2,9)
				"topmostSubform[0]":"d",//
				"Text1": JSON.stringify(user.personal_information) === '{}'? ' ': (user.personal_information.name+' '+(user.personal_information.mi == undefined  ? ' ' :user.personal_information.mi )+' '+user.personal_information.last_Name),
				"Text2":"",//Text
				"Text3":user.job_information.employment_history.data.work1.name_of_employer == undefined ? ' ' :"",//Text
				"Text4":user.job_information.employment_history.data.work1.name_of_employer == undefined ? ' ' :(user.job_information.employment_history.data.work1.name_of_employer),
				"Text5":user.job_information.employment_history.data.work1.attention== undefined ? ' ' :user.job_information.employment_history.data.work1.attention,//Text
				"Text6":user.job_information.employment_history.data.work1.name_of_employer == undefined ? ' ' :(user.job_information.employment_history.data.work1.address+', '+user.job_information.employment_history.data.work1.city+', \n'+user.job_information.employment_history.data.work1.state+', '+user.job_information.employment_history.data.work1.zipcode),
				"Text7":user.job_information.employment_history.data.work1.phone == undefined ? ' ' :user.job_information.employment_history.data.work1.phone,//Text
				"Text8":user.job_information.employment_history.data.work1.fax == undefined ? ' ' :user.job_information.employment_history.data.work1.fax,//Text
				"Text9":user.job_information.employment_history.data.work1.name_of_employer == undefined ? ' ' :"",//Text
				"Text10":user.job_information.employment_history.data.work2.name_of_employer  == undefined ? ' ' :"",//Text
				"Text11":user.job_information.employment_history.data.work2.name_of_employer == undefined ? ' ' :(user.job_information.employment_history.data.work2.name_of_employer),
				"Text12":user.job_information.employment_history.data.work2.attention== undefined ? ' ' :user.job_information.employment_history.data.work2.attention,//Text
				"Text13":user.job_information.employment_history.data.work2.name_of_employer == undefined ? ' ' :(user.job_information.employment_history.data.work2.address+', '+user.job_information.employment_history.data.work2.city+', \n'+user.job_information.employment_history.data.work2.state+', '+user.job_information.employment_history.data.work2.zipcode),
				"Text14":user.job_information.employment_history.data.work2.phone == undefined ? ' ' :user.job_information.employment_history.data.work2.phone,//Text
				"Text15":user.job_information.employment_history.data.work2.fax == undefined ? ' ' :user.job_information.employment_history.data.work2.fax,//Text
				"Text17":user.job_information.employment_history.data.work2.name_of_employer  == undefined ? ' ' :"",//Text
				"Text18":user.ahca.name == undefined ? ' ' :( user.ahca.name+' '+(user.ahca.mi == undefined  ? ' ' :user.ahca.mi )+' '+user.ahca.last_Name),//Text
				"Text19":user.ahca.name == undefined ? ' ' :(user.ahca.address+',  '+user.ahca.city+', '+user.ahca.state+', '+user.ahca.zipcode),//Text
				"Text20":user.evidencelevel2.purpose == undefined ? ' ' :user.evidencelevel2.purpose,//Text
				"Text21":user.evidencelevel2.date == undefined ? ' ' :user.evidencelevel2.date,//Text
				"Check Box22":user.evidencelevel2.agencyhealthcareadministration == undefined ? 'Off' :(user.evidencelevel2.agencyhealthcareadministration),//Button{Off:Yes}
				"Check Box23":user.evidencelevel2.departmenthealth == undefined ? 'Off' :(user.evidencelevel2.departmenthealth),//Button{Off:Yes}
				"Check Box24":user.evidencelevel2.agencypersonswithdisabilities == undefined ? 'Off' :(user.evidencelevel2.agencypersonswithdisabilities),//Button{Off:Yes}
				"Check Box25":user.evidencelevel2.departmentchildrenfamilyservices == undefined ? 'Off' :(user.evidencelevel2.departmentchildrenfamilyservices),//Button{Off:Yes}
				"Check Box26":user.evidencelevel2.departmentfinancialservices == undefined ? 'Off' :(user.evidencelevel2.departmentfinancialservices),//Button{Off:Yes}
				"Text27": JSON.stringify(user.personal_information) === '{}'? ' ': (user.personal_information.name+' '+(user.personal_information.mi == undefined  ? ' ' :user.personal_information.mi )+' '+user.personal_information.last_Name),
				"Text28": JSON.stringify(user.personal_information) === '{}'? ' ': (user.personal_information.present_address),
				"Text29": JSON.stringify(user.personal_information) === '{}'? ' ': (user.personal_information.city+', '+user.personal_information.zip_code),
				//"Text30":"Text30",//Text
				"Text31": JSON.stringify(user.personal_information) === '{}'? ' ': (user.personal_information.social_security_number),//Tex)t
				//"Text32":"",//Text
				"Text33":"",//Text
				"Text34":"",//Text
				//"Text35":"Text35",//Text
				//"Text16":"Text16",//Text
				//"Text22":"Text22",//Text
				//"Text23":"Text23",//Text
				//"Text24":"Text24",//Text
				//"Text25":"Text25",//Text
				//"Text26":"Text26",//Text
				//"Text36":"Text36",//Text
				//"Text37":"Text37",//Text
				//"Text38":"Text38",//Text
				//"Text39":"Text39",//Text
				//"Text40":"Text40",//Text
				//"Text41":"Text41",//Text
				//"Text42":"Text42",//Text
				//"Text43":"Text43",//Text
				//"Text44":"Text44",//Text
				//"Text45":"Text45",//Text
				//"Text46":"Text46",//Text
				//"Text47":"Text47",//Text
				"EMPLOYEE NAME": JSON.stringify(user.personal_information) === '{}'? ' ': ( user.personal_information.name+' '+(user.personal_information.mi == undefined  ? ' ' :user.personal_information.mi )+' '+user.personal_information.last_Name),//Tex)t
				//"Text48":"Text48"//Text  */
              };
}




function getPdf2(req,res){

  //var user_id = req.user.sub;
  var params=req.params;
  console.log("parametros ");
  console.log(params);
 
   var user_id = params.sub;
   
  var pdf_file = params.pdfselected;//'3';
  var path_file = ('./forms/filled_forms/'+user_id+'_'+ pdf_file+'.pdf');
  var sourcePDF = ('./forms/source_forms/'+pdf_file+'.pdf');
  var data=null;


  User.findOne({_id: user_id}, (err, user) => {
      if (err) return  res.status(500).send({message: 'Error in the find of pdf3.'});
      if (user) {

      		switch(pdf_file){
      			//default :data=data3(user);break;
      			case '3':data=data3(user);break;
      			default: return  res.status(500).send({message: 'Error el pdf '+pdf_file+' no existe.'});
      		}

  		     //si es false devuelve los campos editables, si es true  los devuelve como campos no editables 
          var shouldFlatten=true;
          /*esta funcion permite exportar 
          solo los campos que creas neseasrios 
          para el pdf y no todos como era con fillForm*/
          console.log("ini "+__dirname );
          console.log(sourcePDF+'\n'+ path_file+'\n'+  data+'\n'+ shouldFlatten);
           pdfFiller.fillFormWithFlatten(sourcePDF, path_file, data,shouldFlatten, function (err2) {
              if (err) return  res.status(500).send({message: 'Error in the pdffiller of pdf3.'});
              fs.exists(path_file, (exists) => {
                 if (exists) {
                 			  res.contentType("application/pdf");
                     return   res.sendFile(path.resolve(path_file));
           
				/*  
					console.log('Archivo creado satisfactoriamente ....');
		            var enviar = fs.readFileSync(path_file, 'binary');
		            res.setHeader('Content-Length', enviar.length);
		            res.write(enviar, 'binary');
		            res.end();
		            console.log('Archivo enviado satisfactoriamente ....');
		        */  


                 } else {
                     return   res.status(200).send({message: 'Pdf3  not exist'});
                 }
              });
           });

      } else{
         return  res.status(500).send({message: 'Error el usuario no existe.'});
      }

  });
} 
