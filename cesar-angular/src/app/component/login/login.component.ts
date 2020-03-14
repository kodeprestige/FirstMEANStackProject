import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params} from '@angular/router';

//User
import { User } from '../../models/user'
import { UserService } from '../../services/user.service';

//Utils
import { UTILS } from '../../services/utils';

//Form
import { FormBuilder, 
	FormGroup, 
	FormControl, 
	FormGroupDirective, 
	NgForm, 
	Validators } from '@angular/forms';

import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { ErrorStateMatcher } from '@angular/material/core';

//animate
import { trigger, transition, useAnimation } from '@angular/animations';
import {
  lightSpeedIn,
  rubberBand,
  swing
} from 'ng-animate';

@Component({
	selector: 'login',
	templateUrl: './login.component.html',
	styleUrls: ['./login.component.css'],
	providers: [UserService],

	//animations
	encapsulation: ViewEncapsulation.None,
  	animations: [
  	//Entry login
    	trigger('lightSpeedIn', [transition('* => *', useAnimation(lightSpeedIn))]),
    	trigger('rubberBand', [transition('* => *', useAnimation(rubberBand))]),
    	trigger('swing', [transition('* => *', useAnimation(swing))])
  	]
})

export class LoginComponent implements OnInit {

	public title: string;
	public user: User;
	public identity;
	public token;
	public status: string;
	public message: string;
	public loginShow: string;

	rubberBand = false;
	swing = false;

	constructor(
		private _route: ActivatedRoute,
		private _router: Router,
		private _userService: UserService,
		private formBuilder: FormBuilder
	){
		this.title = 'Welcome to Concepts in Eldercare for employees';
		this.user = new User ("", "", "", "", "", "", "ROLE_USER", "", "");

		this.loginShow = "form";
		this.status = "error";
		this.message = 'Sorry. An internal error occurred.';
	}
	
	ngOnInit() {
		
	}

	email = new FormControl('', [Validators.required, Validators.email]);
	password = new FormControl('', [Validators.required]);
	errorState = new MyErrorStateMatcher();

	onSubmit(loginForm: NgForm) {
		if (!this.isFormValid([this.email, this.password], loginForm)) {
			//Incorrect login
    		this.rubberBand = !this.rubberBand;
			return;
		}

		this.loginShow = 'progress';

		this.user.nick = this.email.value;
		this.user.password = this.password.value;
		this.password.reset();
		
		this._userService.singup(this.user, true).subscribe(
			response => {
				console.log(this.user);
				console.log(response);
				let user = response.user;
				this.identity = response.user;
				if(user && (this.identity = user.identity) && this.identity._id && (this.token = user.token)) {
					this.status = 'success';

					console.log(this.identity);
					console.log(this.token);
					
					//Persist user data
					localStorage.setItem('identity', JSON.stringify(this.identity));
					localStorage.setItem('token', this.token);

					//Get user statistics


					//Go to My data
					this._router.navigate(['/']);

				} else {
					this.loginShow = 'alert';
					this.message = 'Sorry. An internal error occurred.';
				}
			},
			err => {;
				console.log(err);

				if(err && (this.message = err.error.message)) {
					if(this.message != 'Nickname or Password you entered was incorrect.' && this.message != 'Email or Password you entered was incorrect.') {
						console.log(this.message);
						this.message = 'Sorry. An internal error occurred.';
					}
				} else {
					this.message = 'Sorry. An internal error occurred.';
				}

				this.loginShow = 'alert';

				this.rubberBand = !this.rubberBand;

			}
		);
	}

	tryAgain(){
		this.swing = !this.swing;
		this.loginShow = "form";
	}

	isFormValid(controls: FormControl[], form: NgForm): boolean {
		var flag = false;
		var i = 0;


		var BreakException = {};

		try {
			controls.forEach(control => {
				console.log(i++);
				if(flag = this.errorState.isErrorState(control, form)){
					console.log(flag);
					console.log(control);
					throw BreakException;
				}
			});
		} catch (e) {
		  	if (e !== BreakException) throw e;
		}

		
		console.log("2");
		console.log(flag);
		return !flag;
	}

  	getErrorMessage() {
	    return this.email.hasError('required') ? 'You must enter a value' :
	        this.email.hasError('email') ? 'Not a valid email' :
	            '';
	}

}

/** Error when invalid control is dirty, touched, or submitted. */
export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}