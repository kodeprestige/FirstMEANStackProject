import { ErrorStateMatcher } from '@angular/material/core';

//Form
import { FormBuilder,
	FormControl,
	AbstractControl, 
	FormGroupDirective,
	NgForm,
	Validators } from '@angular/forms';

//Utils
import { UTILS } from './utils';

export class Controls {

	getEmailErrorMessage(email: AbstractControl) {
	    return email.hasError('required') ? 'You must enter a value' :
	        email.hasError('email') ? 'Not a valid email' :
	            '';
	}

	emailValidator(control: AbstractControl): { [key: string]: boolean } | null {
		var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	    if (control.value != undefined && (control.value == '' || !re.test(control.value))) {
	        return { 'email': true };
	    }
	    return null;
	}

	passwordValidator(control: AbstractControl): { [key: string]: boolean } | null {

		/**
			* Minimo 8 caracteres
			* Maximo 15
			* Al menos una letra mayúscula
			* Al menos una letra minucula
			* Al menos un dígito
			* Al menos 1 caracter especial
		

		var regexp_password = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[$@$!%*?&])[A-Za-z\d$@$!%*?&]{8,15}/;*/
	    if (control.value != undefined && (control.value == '' || (control.value.length < 5 || control.value.length > 15) /*!regexp_password.test(control.value)*/)) {
	        if(control.parent) {
	        	control.parent.get("repassword").disable({emitEvent: true});
	        }
	        return { 'password': true };
	    }
	    if(control.parent) 
	    	control.parent.get("repassword").enable();
	    return null;
	}

	matchPasswordValidator(control: AbstractControl): { [key: string]: boolean } | null {
	    if (control.value != undefined && control.parent!= undefined && control.value != control.parent.get("password").value) {
	        return { 'matchPassword': true };
	    }
	    return null;
	}

	stateUSValidator(control: AbstractControl): { [key: string]: boolean } | null {
		const ops = (<StateUsControls> control)._filterGroup(control.value);
		const value: string = control.value;
	    if (value == undefined) { return null; }

    	if (value == '' || ops.length != 1) {
    		return { 'stateGroup': true };
    	}

    	for (let op of ops[0].names) {
    		if (value == op) {
    			return null;
    		}
    	}

    	return { 'stateGroup': true };    
	}

	isFormValid(controls: FormControl[], form: NgForm, errorState: MyErrorStateMatcher): boolean {
		var flag = false;
		var i = 0;


		var BreakException = {};

		try {
			controls.forEach(control => {
				console.log(i++);
				if(flag = errorState.isErrorState(control, form) || control.invalid){
					console.log(i + ": " + flag + ": " + control.value);
					throw BreakException;
				}
			});
		} catch (e) {
		  	if (e !== BreakException) throw e;
		}

		
		console.log(i + ": " + flag);
		return !flag;
	}

}

/** Error when invalid control is dirty, touched, or submitted. */
export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}

//State USA
export interface StateGroup {
  letter: string;
  names: string[];
}

export const _filter = (opt: string[], value: string): string[] => {
  const filterValue = value.toLowerCase();

  return opt.filter(item => item.toLowerCase().indexOf(filterValue) === 0);
};

export class StateUsControls extends FormControl {

	stateGroups: StateGroup[] = UTILS.StateUsaGroup;

	_filterGroup(value: string): StateGroup[] {
	    if(!this.stateGroups) this.stateGroups = UTILS.StateUsaGroup;

	    if (value) {
	      return this.stateGroups
	        .map(group => ({letter: group.letter, names: _filter(group.names, value)}))
	        .filter(group => group.names.length > 0);
	    }

	    return this.stateGroups;
	}

}