'use strict'

var mongoose = require('mongoose');
var app = require('./app');
var port = 3800;

//Connection database
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/eldercare', { useNewUrlParser: true})
		.then(() => {
			console.log("connection success");

			//Create server
			app.listen(port, () => {
				console.log("Server is running in port " + port);
			});

		})
		.catch(err => console.log(err));
