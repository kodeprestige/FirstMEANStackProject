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

//State USA
export interface StateGroup {
  letter: string;
  names: string[];
}

//State USA
export const _filter = (opt: string[], value: string): string[] => {
  const filterValue = value.toLowerCase();

  return opt.filter(item => item.toLowerCase().indexOf(filterValue) === 0);
};

@Component({
	selector: 'register',
	templateUrl: './register.component.html',
	styleUrls: ['./register.component.css'],
	providers: [UserService],

	//animations
	encapsulation: ViewEncapsulation.None,
  	animations: [
    	trigger('lightSpeedIn', [transition('* => *', useAnimation(lightSpeedIn))]),
    	trigger('rubberBand', [transition('* => *', useAnimation(rubberBand))]),
    	trigger('swing', [transition('* => *', useAnimation(swing))])
  	]
})

export class RegisterComponent implements OnInit {

	public title: string;
	public user: User;
	public identity;
	public token;
	public message: string;
	public loginShow: string;
	public incorrectLogin: boolean;

	rubberBand = false;
	swing = false;

	//State USA
	stateForm: FormGroup = this.formBuilder.group({
		stateGroup: 'Florida',
	});
	stateGroups: StateGroup[] = UTILS.StateUsaGroup;
  	stateGroupOptions: Observable<StateGroup[]>;


	constructor(
		private _route: ActivatedRoute,
		private _router: Router,
		private _userService: UserService,
		private formBuilder: FormBuilder
	){
		this.title = 'Welcome to Concepts in Eldercare for employees';
		this.user = new User ("", "", "", "", "", "", "ROLE_USER", "", "");
		this.loginShow = "form";
		this.message = 'Sorry. An internal error occurred.';
		this.incorrectLogin = false;
	}

	//State USA
	private _filterGroup(value: string): StateGroup[] {
	    if (value) {
	      return this.stateGroups
	        .map(group => ({letter: group.letter, names: _filter(group.names, value)}))
	        .filter(group => group.names.length > 0);
	    }

	    return this.stateGroups;
	}

	//State USA
	private statesToFields() {
		this.stateGroupOptions = this.stateForm.get('stateGroup')!.valueChanges
	      .pipe(
	        startWith('Florida'),
	        map(value => this._filterGroup(value))
	      );
	}
	
	ngOnInit() {
		//State USA
		this.statesToFields();
	}

	email = new FormControl('', [Validators.required, Validators.email]);
	password = new FormControl('', [Validators.required]);
	errorState = new MyErrorStateMatcher();

	onSubmit(loginForm) {

		if (!this.isFormValid([this.email, this.password], loginForm)) {
			//Incorrect login
    		this.rubberBand = !this.rubberBand;
			return;
		}

		this.loginShow = 'progress';
		this.user.email = this.email.value;
		this.user.password = this.password.value;
		this.password.reset();

		this._userService.singup(this.user, true).subscribe(
			response => {
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
					this._router.navigate(['/']);

				} else {
					this.loginShow = 'alert';
					this.message = 'Sorry. An internal error occurred. Try again later.';
				}
			},
			err => {
				this.loginShow = 'alert';
				console.log(err);

				if(err && (this.message = err.error.message)) {
					if(this.message != 'Nickname or Password you entered was incorrect.' && this.message != 'Email or Password you entered was incorrect.') {
						console.log(this.message);
						this.message = 'Sorry. An internal error occurred. Try again later.';
					}
				} else {
					this.message = 'Sorry. An internal error occurred. Try again later.';
				}
			}
		);
		loginForm.reset();
	}


	isFormValid(controls: FormControl[], form: NgForm): boolean {
		var flag = false;
		var i = 0;


		var BreakException = {};

		try {
			controls.forEach(control => {
				console.log(i++);
				if(flag = this.errorState.isErrorState(control, form) || control.invalid){
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