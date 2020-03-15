import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params} from '@angular/router';

//User
import { User } from '../../models/user'
import { UserService } from '../../services/user.service';

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

//Controls
import { Controls, MyErrorStateMatcher } from '../components.utils/controls';

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
    	trigger('lightSpeedIn', [transition('* => *', useAnimation(lightSpeedIn))]),
    	trigger('rubberBand', [transition('* => *', useAnimation(rubberBand))]),
    	trigger('swing', [transition('* => *', useAnimation(swing))])
  	]
})

export class LoginComponent implements OnInit {

	public title: string;
	public subtitle: string;
	public notTitle: string;
	public user: User;
	public identity;
	public token;
	public message: string;
	public loginShow: string;
	public incorrectLogin: boolean;

	public isLoginned: boolean;

	rubberBand = false;
	swing = false;


	controls = new Controls();
	email = new FormControl('', [Validators.required, Validators.email, this.controls.emailValidator]);
	password = new FormControl('', [Validators.required, this.controls.passwordValidator]);
	repassword = new FormControl({value: '', disabled: false}, [Validators.required, this.controls.matchPasswordValidator]);

	constructor(
		private _route: ActivatedRoute,
		private _router: Router,
		private _userService: UserService,
		private formBuilder: FormBuilder
	){
		this.title = 'Log In';
		this.subtitle = 'Welcome to Concepts in Eldercare for employees';
		this.notTitle = 'Sing Up';
		
		this.isLoginned = true;

		this.user = new User ();

		this.loginShow = "form";
		this.message = 'Sorry. An internal error occurred.';
		this.incorrectLogin = false;
	}
	
	ngOnInit() {
		//Password and repassword
		const passwordGroup = new FormGroup({'password' : this.password, 'repassword' : this.repassword});
		this.password.setParent(passwordGroup);
		this.repassword.setParent(passwordGroup);
	}

	toggle(){
		this.isLoginned = !this.isLoginned;
		var tmp = this.title;
		this.title = this.notTitle;
		this.notTitle = tmp;
	}

	errorState = new MyErrorStateMatcher();

	onSubmit(loginForm: NgForm) {
		if (this.isLoginned) {
			this.login(loginForm);
		} else {
			this.register(loginForm);
		}
	}

	login(loginForm: NgForm) {
		if (!this.controls.isFormValid([ 
			this.email, 
			this.password], 
			loginForm, this.errorState)) {
			//Incorrect register
    		this.rubberBand = !this.rubberBand;
			return;
		}

		this.loginShow = 'progress';

		this.user.email = this.email.value;
		this.user.password = this.password.value;
		this.password.reset();
		
		this._userService.singup(this.user, true).subscribe(
			response => {
				console.log(this.user);
				console.log(response);
				let user = response.user;
				this.identity = response.user;
				if(user && (this.identity = user.identity) && this.identity._id && (this.token = user.token)) {

					console.log(this.identity);
					console.log(this.token);
					
					//Persist user data
					localStorage.setItem('identity', JSON.stringify(this.identity));
					localStorage.setItem('token', this.token);

					//Get user statistics


					//Go to My data
					this._router.navigate(['/step-form']);

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
					} else {
						this.incorrectLogin = true;
					}
				} else {
					this.message = 'Sorry. An internal error occurred.';
				}

				this.loginShow = 'alert';

				this.rubberBand = !this.rubberBand;

			}
		);
	}

	register(registerForm: NgForm) {

		if (!this.controls.isFormValid([
			this.email, 
			this.password, 
			this.repassword], 
			registerForm, this.errorState)) {
			//Incorrect register
    		this.rubberBand = !this.rubberBand;
			return;
		}

		this.loginShow = 'progress';

		this.user.email = this.email.value;
		this.user.password = this.password.value;

		this.password.reset();
		this.repassword.reset();
		this.repassword.disable({emitEvent: true});

		//Verify sending email code

		this._userService.register(this.user).subscribe(
			response => {
				if(response.user && response.user._id) {
					//Go to Login
					this.loginShow = 'form';
					this.toggle();
					this._router.navigate(['/home']);
					registerForm.reset();
				} else {
					this.loginShow = 'alert';
					this.message = 'Sorry. An internal error occurred. Try again later.';
				}
			},
			err => {
				this.loginShow = 'alert';
				console.log(err);

				if(err && (this.message = err.error.message)) {
					if(this.message != 'Email already exists.') {
						console.log(this.message);
						this.message = 'Sorry. An internal error occurred. Try again later.';
					}
				} else {
					this.message = 'Sorry. An internal error occurred. Try again later.';
				}
			}
		);
		
	}

	tryAgain(){
		this.swing = !this.swing;
		this.loginShow = "form";
	}

  	getErrorMessage() {
	    return this.email.hasError('required') ? 'You must enter a value' :
	        this.email.hasError('email') ? 'Not a valid email' :
	            '';
	}

}