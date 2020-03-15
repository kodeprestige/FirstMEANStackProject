'use strict'

var pdfFiller = require('pdffiller');
var fs = require('fs');

/*function pdffiller(req, res) {

	var userId;
	if((userId = req.params.id) != req.user.sub) {
		return res.status(500).send({message: 'Permission denied'});
	}

	var opt;

	if (opt = req.body.opt) {*/


function pdffiller() {

	var opt = "1";
		var sourcePDF;
		var destinationPDF;
		var data

		switch (opt) {
			case "1":
				sourcePDF = './forms/source_forms/1.pdf';
				destinationPDF = './forms/filled_forms/1_' + userId + '.pdf';

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

		        var radioselecionado = 3;
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

		        var elOtrocheckbox = 1;
		        if (elOtrocheckbox === "1") {
		            chbox = "1";
		        }



		        data = {
		            "topmostSubform[0].Page1[0].c1_1[0]": op1,
		            "topmostSubform[0].Page1[0].c1_1[1]": op2,
		            "topmostSubform[0].Page1[0].c1_1[2]": op3,
		            "topmostSubform[0].Page1[0].c1_2[0]": chbox,
		            "topmostSubform[0].Page1[0].Line1[0].f1_1[0]": "f1_1",
		            "topmostSubform[0].Page1[0].Line1[0].f1_2[0]": "f1_2",
		            "topmostSubform[0].Page1[0].Line1[0].f1_3[0]": "f1_3",
		            "topmostSubform[0].Page1[0].Line1[0].f1_4[0]": "f1_4",
		            "topmostSubform[0].Page1[0].f1_13[0]": "f1_13",
		            "topmostSubform[0].Page1[0].f1_5[0]": "f1_5",
		            "topmostSubform[0].Page1[0].f1_6[0]": "f1_6",
		            "topmostSubform[0].Page1[0].f1_7[0]": "f1_7",
		            "topmostSubform[0].Page1[0].f1_8[0]": "f1_8",
		            "topmostSubform[0].Page1[0].f1_9[0]": "f1_9",
		            "topmostSubform[0].Page1[0].f1_10[0]": "f1_10",
		            "topmostSubform[0].Page3[0].f3_1[0]": "f3_1",
		            "topmostSubform[0].Page3[0].f3_2[0]": "f3_2",
		            "topmostSubform[0].Page3[0].f3_3[0]": "f3_3",
		            "topmostSubform[0].Page3[0].f3_4[0]": "f3_4",
		            "topmostSubform[0].Page3[0].f3_5[0]": "f3_5",
		            "topmostSubform[0].Page3[0].f3_6[0]": "f3_6",
		            "topmostSubform[0].Page3[0].f3_7[0]": "f3_7",
		            "topmostSubform[0].Page3[0].f3_8[0]": "f3_8",
		            "topmostSubform[0].Page3[0].f3_9[0]": "f3_9",
		            "topmostSubform[0].Page3[0].f3_10[0]": "f3_10",
		            "topmostSubform[0].Page3[0].f3_11[0]": "f3_11",
		            "topmostSubform[0].Page3[0].f3_12[0]": "f3_12",
		            "topmostSubform[0].Page3[0].f3_13[0]": "f3_13",
		            "topmostSubform[0].Page3[0].f3_14[0]": "f3_14",
		            "topmostSubform[0].Page3[0].f3_15[0]": "f3_15",
		            "topmostSubform[0].Page3[0].f3_16[0]": "f3_16",
		            "topmostSubform[0].Page3[0].f3_17[0]": "f3_17",
		            "topmostSubform[0].Page3[0].f3_18[0]": "f3_18",
		            "topmostSubform[0].Page4[0].f4_1[0]": "f4_1",
		            "topmostSubform[0].Page4[0].f4_2[0]": "f4_2",
		            "topmostSubform[0].Page4[0].f4_3[0]": "f4_3",
		            "topmostSubform[0].Page4[0].f4_4[0]": "f4_4",
		            "topmostSubform[0].Page4[0].f4_5[0]": "f4_5",
		            "topmostSubform[0].Page4[0].f4_6[0]": "f4_6",
		            "topmostSubform[0].Page4[0].f4_7[0]": "f4_7",
		            "topmostSubform[0].Page4[0].f4_8[0]": "f4_8",
		            "topmostSubform[0].Page4[0].f4_9[0]": "f4_9"
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
	    
}


          

