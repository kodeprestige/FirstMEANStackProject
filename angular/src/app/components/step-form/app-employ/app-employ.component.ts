import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute, Params } from '@angular/router';

//User
import { User } from '../../../models/user'
import { UserService } from '../../../services/user.service';

//Upload
import { UploadService } from '../../../services/upload.service';
import { forkJoin } from 'rxjs/observable/forkJoin';

import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

//Controls
import { Controls, MyErrorStateMatcher, StateUsControls, StateGroup } from '../../components.utils/controls';
import { UTILS } from '../../components.utils/utils';


@Component({
  selector: 'step-form',
  templateUrl: './app-employ.component.html',
  styleUrls: ['../step-form.component.css'],
  providers: [UserService, UploadService]
})

export class AppEmployComponent implements OnInit {

  public user: User;
  public identity;
  public token;
  public message: string;
  public marcado:boolean;
  public posr: string;
  

  controls = new Controls();

  piFormGroup: FormGroup;
  //Date
  minDate: Date;
  maxDate: Date;  
  //Gender
  genders: string[];

  addressFormGroup: FormGroup;
  //State USA
  stateGroupOptions: Observable<StateGroup[]>;
  stateGroupOptions1: Observable<StateGroup[]>;

  contactInfFormGroup: FormGroup;

  socialSecurityNumber: FormGroup;
  


  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _userService: UserService,
    private _uploadService: UploadService,
    private _formBuilder: FormBuilder
  ){
    this.identity = this._userService.getIdentity();
    this.user = this.identity;
    this.token = this._userService.getToken();
    this.message = 'Sorry. An internal error occurred.';
    this.posr=this._userService.getTStep();
  }

  ngOnInit() {
    this.checkStep();

    this.piFormGroup = this._formBuilder.group({
      name: ['', Validators.required],
      mi: [''],
      lastname: ['', Validators.required],
      birthday: ['', Validators.required],
      gender: ['', Validators.required]
    });
    //Date of birthday
    this.minDate = new Date(1900, 0, 1);
    this.maxDate = new Date();  
    //Gender
    this.genders = UTILS.Gender;

    this.addressFormGroup = this._formBuilder.group({
      address: ['', Validators.required],
      city: ['', Validators.required],
      state: new StateUsControls('Florida', [Validators.required, this.controls.stateUSValidator]),
      zip_code: ['',[Validators.pattern(/^(\d{5})$/),Validators.required]],
      address2: [''],
      city2: [''],
      state2: new StateUsControls('Florida'),
      zip_code2: ['',Validators.pattern(/^(\d{5})$/)],
      otheraddress: ['']
    });
    //State USA
    this.statesToFields();

    this.contactInfFormGroup = this._formBuilder.group({
      phone: ['', [Validators.pattern(/^(\d{10})$/),Validators.required]],
      email: [{value: this.user.email, disabled: true}, [Validators.required, Validators.email, this.controls.emailValidator]]
    });

    this.socialSecurityNumber = this._formBuilder.group({
      socialSecurityNumber: ['', [Validators.pattern(/^(\d{9})$/),Validators.required]]
    });
    

  }

  lo(){console.log("lololololo");}

  onSubmit(){
    console.log('submitting');
    console.log(this.user);

    this.user.name = this.piFormGroup.get('name').value; 
    this.user.mi = this.piFormGroup.get('mi').value; 
    this.user.last_Name = this.piFormGroup.get('lastname').value;
    this.user.date_of_birthday = this.piFormGroup.get('birthday').value;
    this.user.gender = this.piFormGroup.get('gender').value; 
    this.user.social_security_number=this.socialSecurityNumber.get('socialSecurityNumber').value;
    this.user.present_address = this.addressFormGroup.get('address').value; 
    this.user.city = this.addressFormGroup.get('city').value; 
    this.user.state = this.addressFormGroup.get('state').value; 
    this.user.zip_code = this.addressFormGroup.get('zip_code').value;
    if (this.addressFormGroup.get('otheraddress').value) {
    this.user.permanent_address_if_different = this.addressFormGroup.get('address2').value; 
    this.user.city2 = this.addressFormGroup.get('city2').value; 
    this.user.state2 = this.addressFormGroup.get('state2').value; 
    this.user.zip_code2 = this.addressFormGroup.get('zip_code2').value;
    } 
    


    this.user.phone = this.contactInfFormGroup.get('phone').value;


    this._userService.fillPersonalInformation(this.user).subscribe(
      response => {
        if(response.next) {
		
		  this.user.complete=0;
          localStorage.setItem('identity', JSON.stringify(this.user));
          this.identity = this.user;
          console.log(response.message);
          //Go to My data
          this.nextStep();

        } else {

          console.log(this.message = 'Try again.');
        }
      },
      err => {
        console.log(err);

        if(err && (this.message = err.error.message)) {
          console.log(err.error.message);
        } else {
          this.message = 'Try again.';
        }
      }
    );
  }

  //State USA
  private statesToFields() {
    var stateGroup =  this.addressFormGroup.get('state');
    this.stateGroupOptions = stateGroup!.valueChanges
      .pipe(
        startWith('Florida'),
        map(value => (<StateUsControls>stateGroup)._filterGroup(value))
      );
    var stateGroup1 =  this.addressFormGroup.get('state2');
    this.stateGroupOptions1 = stateGroup1!.valueChanges
      .pipe(
        startWith('Florida'),
        map(value => (<StateUsControls>stateGroup1)._filterGroup(value))
      );
  }


  //Message
  getEmailErrorMessage() {
      return this.controls.getEmailErrorMessage(this.contactInfFormGroup.get('email'));
  }

  toggleVisibility(e){
    var otheraddress = this.addressFormGroup.get('otheraddress').value
    var arr=['address2','city2','state2','zip_code2'];
    for( let i = 0; i < arr.length; i++){
        let element = arr[i];
        this.addressFormGroup.get(element).clearValidators();
        this.addressFormGroup.get(element).setValidators(otheraddress?Validators.required:null);
        this.addressFormGroup.get(element).updateValueAndValidity();
      }
  }


  public ruta='/personal-information';


  checkStep(){      
      let posthisruting=this._userService.getPosR(this.ruta);//posiscion de la ruta actual a llenar
      let posthisuser=this._userService.getPosU();//posiscion de la ultima ruta que completo el usuario     

      if (posthisruting==posthisuser+1) {return;}
      
          let nextpos=this._userService.nextRStep();                
          return this._router.navigate([nextpos]); 
      
    }

    nextStep(){            
      let nextpos=this._userService.nextRStep();                
      return this._router.navigate([nextpos]); 
    }




}
