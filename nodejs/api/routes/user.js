'use strict'

var express = require('express');
var UserController = require('../controllers/user');

var api = express.Router();
var md_auth = require('../middlewares/authenticated');

var multiparty = require('connect-multiparty');
var md_upload = multiparty({uploadDir: './uploads/users'});
var md_upload2 = multiparty({uploadDir: './uploads/resume'});

api.post('/register', UserController.saveUser);
api.post('/login', UserController.loginUser);
api.get('/user/:id', md_auth.ensureAuth, UserController.getUser);
api.get('/users/:page?/:itemsPerPage?', md_auth.ensureAuth, UserController.getUsers);
api.put('/update-user/:id', md_auth.ensureAuth, UserController.updateUser);
api.post('/upload-image-user/:id', [md_auth.ensureAuth, md_upload], UserController.uploadImage);
api.post('/upload/:id/:id_doc', UserController.upload);
api.get('/get-image-user/:imageFile', [md_auth.ensureAuth, md_upload], UserController.getImageFile);
api.post('/fillPersonalInformation', md_auth.ensureAuth, UserController.fillPersonalInformation);
api.post('/fillJobInformation', [md_auth.ensureAuth, md_upload2], UserController.fillJobInformation);
api.post('/fillUploadFiles', [md_auth.ensureAuth, md_upload], UserController.fillUploadFiles);
api.post('/fillEmergencyInformation', md_auth.ensureAuth, UserController.fillEmergencyInformation);
api.post('/getPDF',md_auth.ensureAuth, UserController.getPdf);
api.get('/getPDF2/:pdfselected/:sub', UserController.getPdf2);
api.post('/fillAhcaInformation', md_auth.ensureAuth, UserController.fillahca);
api.post('/fillW9Information', md_auth.ensureAuth, UserController.fillw9);

module.exports = api;