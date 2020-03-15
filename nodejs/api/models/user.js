'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var UserSchema = Schema({
	email: { type: String, lowercase: true, match: /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/, unique: true },
	password: String,
	role: String,
	driver_lic:String,
	created_at: String,	
    last_change: Number,
    complete:Number,
    personal_information: {
        name: String,
        last_Name:String,
        mi:String,
		date_of_birthday:Date,
		gender:String,
        social_security_number: String,
        present_address: String,
        city: String,
		state: String,
		zip_code: String,
        permanent_address_if_different: String,
        city_if_different: String,
		state_if_different: String,
		zip_code_if_different: String,
        phone: String,
        referredby:String,
    },
    job_information:{
    	applaying_job: String,
    	requred_documments: {
    		state_lic:String,
			proof_of_liability_insurance:String,
			cpr_card:String,
			hiv_aids:String,
			osha:String,
			dom_violence:String,
			driver_lic:String,
			auto_insurance:String,
			residency:String,
			ssc:String,
			physical_exam:String
    	},
    	education_information:{
    		lv1:{
				name:String,
				address: String,
		        city:String,
				state:String,
				zipcode:String,
				years_attended:String,
				subject_studied:String
			  },
			lv2:{
				name:String,
				address: String,
		        city:String,
				state:String,
				zipcode:String,
				years_attended:String,
				subject_studied:String
			  },
			lv3:{
				name:String,
				address: String,
		        city:String,
				state:String,
				zipcode:String,
				years_attended:String,
				subject_studied:String
			  },
			lv4:{
				name:String,
				address: String,
		        city:String,
				state:String,
				zipcode:String,
				years_attended:String,
				subject_studied:String
			  }

    	},
    	employment_history:{
    		resume:String,
    		data:{
    			work1:{
		    		from:String,
					to: String,
					name_of_employer:String,
					address: String,
			        city:String,
					state:String,
					zipcode:String,
					position:String,
					reason_for_leaving:String,
					attention:String,
					phone:String,
					fax:String
	    		},
	    		work2:{
		    		from:String,
					to: String,
					name_of_employer:String,
					address: String,
			        city:String,
					state:String,
					zipcode:String,
					position:String,
					reason_for_leaving:String,
					attention:String,
					phone:String,
					fax:String
	    		},
	    		work3:{
		    		from:String,
					to: String,
					name_of_employer:String,
					address: String,
			        city:String,
					state:String,
					zipcode:String,
					position:String,
					reason_for_leaving:String,
					attention:String,
					phone:String,
					fax:String
	    		}
    		}

    	}
    },
    emergency_information: {
    	contact_primary:{
    		name: String,
	        last_Name:String,
	        mi:String,
	        relationship:String,
	        address: String,
	        city:String,
			state:String,
			zipcode:String,
	        telephone: String
	    },
       	contact_secondary:{
    		name: String,
	        last_Name:String,
	        mi:String,
	        relationship:String,
	        address: String,
	        city:String,
			state:String,
			zipcode:String,
	        telephone: String
	    }
    },
    ahca:{
    	name: String,
        last_Name:String,
        mi:String,
        address: String,
        city:String,
		state:String,
		zipcode:String,
    },
    evidencelevel2:{
    	purpose:String,
    	date:String,
    	agencyhealthcareadministration: String,
    	departmenthealth:String,
    	agencypersonswithdisabilities:String,
    	departmentchildrenfamilyservices:String,
    	departmentfinancialservices:String
    },
    w9:{
    	name:String,
    	business:String,
    	exemptpayee:String,
    	individual:String,
    	ccorporation:String,
    	scorporation:String,
    	partnership:String,
    	trust:String,
    	limited:String,
    	classification:String,
    	other:String,
    	othert:String,
    	address: String,
        city:String,
		state:String,
		zipcode:String,
    	listaccountnumber :String,
    	number:String
    }
});

module.exports = mongoose.model('User', UserSchema);