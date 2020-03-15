'use strict'

var express = require('express');
var UserController = require('../controllers/user');

var api = express.Router();
var md_auth = require('../middlewares/authenticated');

var multiparty = require('connect-multiparty');
var md_upload = multiparty({uploadDir: './uploads/users'});

api.post('/register', UserController.saveUser);
api.post('/login', UserController.loginUser);
api.get('/user/:id', md_auth.ensureAuth, UserController.getUser);
api.get('/users/:page?/:itemsPerPage?', md_auth.ensureAuth, UserController.getUsers);
api.put('/update-user/:id', md_auth.ensureAuth, UserController.updateUser);
api.post('/upload-image-user/:id', [md_auth.ensureAuth, md_upload], UserController.uploadImage);
api.post('/upload/:id/:id_doc', UserController.upload);
api.get('/get-image-user/:imageFile', [md_auth.ensureAuth, md_upload], UserController.getImageFile);

api.get('/test', md_auth.ensureAuth, UserController.test);

module.exports = api;