import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params} from '@angular/router';

//User
import { User } from '../../models/user'
import { UserService } from '../../services/user.service';

//Controls
import { Controls, MyErrorStateMatcher, StateUsControls, StateGroup } from '../components.utils/controls';

//Form
import { FormBuilder, 
	FormGroup, 
	FormControl,
	AbstractControl, 
	FormGroupDirective, 
	NgForm, 
	Validators } from '@angular/forms';

import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

//animate
import { trigger, transition, useAnimation } from '@angular/animations';
import {
  lightSpeedIn,
  rubberBand,
  swing
} from 'ng-animate';

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
	public registerShow: string;
	public incorrectRegister: boolean;

	rubberBand = false;
	swing = false;
	
	controls = new Controls();

  	//form field
	name = new FormControl('', [Validators.required]);
	mi = new FormControl();
	lastname = new FormControl('', [Validators.required]);

	//Date of birthday
	minDate = new Date(1900, 0, 1);
  	maxDate = new Date();

	address = new FormControl('', [Validators.required]);
	address2 = new FormControl();
	city = new FormControl('', [Validators.required]);

	//State USA
  	stateGroupOptions: Observable<StateGroup[]>;
  	stateGroup  = new StateUsControls('Florida', [Validators.required, this.controls.stateUSValidator]);

	zip = new FormControl('', [Validators.required]);

	positions: string[] = [
    	"lnlnn",
    	"uhjbjb"
  	];
	position = new FormControl('', [Validators.required]);

	phone = new FormControl('', [Validators.required]);
	email = new FormControl('', [Validators.required, Validators.email, this.controls.emailValidator]);
	password = new FormControl('', [Validators.required, this.controls.passwordValidator]);
	repassword = new FormControl({value: '', disabled: false}, [Validators.required, this.controls.matchPasswordValidator]);


	constructor(
		private _route: ActivatedRoute,
		private _router: Router,
		private _userService: UserService,
		private formBuilder: FormBuilder
	){
		this.title = 'Welcome to Concepts in Eldercare for employees';
		this.user = new User ();
		this.registerShow = "form";
		this.message = 'Sorry. An internal error occurred.';
		this.incorrectRegister = false;
	}

	//State USA
	private statesToFields() {
		this.stateGroupOptions = this.stateGroup!.valueChanges
	      .pipe(
	        startWith('Florida'),
	        map(value => this.stateGroup._filterGroup(value))
	      );
	}
	
	ngOnInit() {
		//State USA
		this.statesToFields();

		const passwordGroup = new FormGroup({'password' : this.password, 'repassword' : this.repassword});
		this.password.setParent(passwordGroup);
		this.repassword.setParent(passwordGroup);

	}

	errorState = new MyErrorStateMatcher();

	onSubmit(registerForm: NgForm) {

		if (!this.controls.isFormValid([
			this.name, 
			this.mi, 
			this.lastname, 
			this.address, 
			this.address2, 
			this.city,
			this.zip,
			this.stateGroup,
			this.phone,
			this.position, 
			this.email, 
			this.password, 
			this.repassword], registerForm, 
			this.errorState)) {
			//Incorrect register
    		this.rubberBand = !this.rubberBand;
			return;
		}

		this.registerShow = 'progress';

		this.user.name = this.name.value; 
		this.user.mi = this.mi.value;
		this.user.lastname = this.lastname.value; 
		this.user.address = this.address.value; 
		this.user.address2 = this.address2.value; 
		this.user.city = this.city.value;
		this.user.state = this.stateGroup.value;
		this.user.zip_code = this.zip.value;

		this.user.speciality = this.position.value;
		this.user.phone = this.phone.value; 

		//borrar
		this.user.phone = '1234567890'; 

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
					this._router.navigate(['/']);
					registerForm.reset();
				} else {
					this.registerShow = 'alert';
					this.message = 'Sorry. An internal error occurred. Try again later.';
				}
			},
			err => {
				this.registerShow = 'alert';
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

	getEmailErrorMessage() {
	    return this.controls.getEmailErrorMessage(this.email);
	}

	tryAgain(){
		this.swing = !this.swing;
		this.registerShow = "form";
	}

}

