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
} from 'ng-animate';

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
    	trigger('lightSpeedIn', [transition('* => *', useAnimation(lightSpeedIn))])
  	]
})

export class RegisterComponent implements OnInit {

	public title: string;
	public user: User;
	public identity;
	public token;
	public status: string;
	public message: string;

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

	onSubmit(loginForm) {
		this._userService.singup(this.user, true).subscribe(
			response => {
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
					this.status = 'error';
					this.message = 'Sorry. An internal error occurred. Try again later.';
				}
			},
			err => {
				this.status = 'error';
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


	email = new FormControl('', [Validators.required, Validators.email]);

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