import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { MatCheckboxModule } from '@angular/material/checkbox';

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
  selector: 'ahca-information',
  templateUrl: './ahca-information.component.html',
  styleUrls: ['../step-form.component.css'],
  providers: [UserService, UploadService]
})

export class AhcaInformationComponent implements OnInit {

  public user; 
  public identity;
  public token;
  public message: string;
  public posr: string;
  
//Date 
  minDate: Date;
  maxDate: Date;   
  controls = new Controls();
  ahcaFormGroup: FormGroup; 
  evidencelevel2FormGroup: FormGroup;
  

  //State USA
  stateGroupOptions: Observable<StateGroup[]>;

  
  
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

  toggleVisibility(e){
    var evidencelevel2 = this.evidencelevel2FormGroup.get('evidencelevel2').value
    var arr=['purpose','date'];
    for( let i = 0; i < arr.length; i++){
        let element = arr[i];
        this.evidencelevel2FormGroup.get(element).clearValidators();
        this.evidencelevel2FormGroup.get(element).setValidators(evidencelevel2?Validators.required:null);
        this.evidencelevel2FormGroup.get(element).updateValueAndValidity();
      }
  }
  
  ngOnInit() {

    this.checkStep();

    
   let namew=this.user.personal_information?this.user.personal_information.name:this.user.name;
   let miw=this.user.personal_information?this.user.personal_information.mi:(this.user.mi?this.user.mi:'');
   let last_Namew=this.user.personal_information?this.user.personal_information.last_Name:this.user.last_Name
   let present_addressw=this.user.personal_information?this.user.personal_information.present_address:this.user.present_address
   let cityw=this.user.personal_information?this.user.personal_information.city:this.user.city
   let statew=this.user.personal_information?this.user.personal_information.state:this.user.state
   let zip_codew=this.user.personal_information?this.user.personal_information.zip_code:this.user.zip_code


    
    this.ahcaFormGroup = this._formBuilder.group({
		name: [namew, Validators.required],
    mi: [miw],
    last_name: [last_Namew, Validators.required],
    address: [present_addressw, Validators.required],
    city: [cityw, Validators.required],
    zipcode:  [zip_codew, [Validators.pattern(/^(\d{5})$/),Validators.required]],
    state: new StateUsControls(statew), 
    }); 
	  this.evidencelevel2FormGroup = this._formBuilder.group({
		evidencelevel2: [''],
		purpose: [''],
		date: [''],
		agencyhealthcareadministration:  [''],
		departmenthealth:  [''],
		agencypersonswithdisabilities:  [''],
		departmentchildrenfamilyservices: [''],
		departmentfinancialservices: ['']
    });
    this.statesToFields();
    console.log('adios state');
 }

 
  onSubmit(){     
    this.user.ahca_name = this.ahcaFormGroup.get('name').value;
    this.user.ahca_last_name = this.ahcaFormGroup.get('last_name').value;
    this.user.ahca_address = this.ahcaFormGroup.get('address').value;
    this.user.ahca_city = this.ahcaFormGroup.get('city').value;
    this.user.ahca_state = this.ahcaFormGroup.get('state').value;
    this.user.ahca_zip_code = this.ahcaFormGroup.get('zipcode').value;
    if (this.ahcaFormGroup.get('mi').value) {
      this.user.ahca_mi= this.ahcaFormGroup.get('mi').value;
    }
    this.user.evidencelevel2=this.evidencelevel2FormGroup.get('evidencelevel2').value;
	if(this.user.evidencelevel2){
		this.user.evidencelevel2_purpose= this.evidencelevel2FormGroup.get('purpose').value;
		this.user.evidencelevel2_date= this.evidencelevel2FormGroup.get('date').value;

		this.user.evidencelevel2_agencyhealthcareadministration=(this.evidencelevel2FormGroup.get('agencyhealthcareadministration').value)?true:false;
		this.user.evidencelevel2_departmenthealth=(this.evidencelevel2FormGroup.get('departmenthealth').value)?true:false;
		this.user.evidencelevel2_agencypersonswithdisabilities=(this.evidencelevel2FormGroup.get('agencypersonswithdisabilities').value)?true:false;
		this.user.evidencelevel2_departmentchildrenfamilyservices= (this.evidencelevel2FormGroup.get('departmentchildrenfamilyservices').value)?true:false;
		this.user.evidencelevel2_departmentfinancialservices=(this.evidencelevel2FormGroup.get('departmentfinancialservices').value) ?true:false;
	}
     
    this._userService.fillAhcaInformation(this.user).subscribe(
      response => {
        if(response.next) {
		  this.user.complete++;
          localStorage.setItem('identity', JSON.stringify(this.user));
          this.identity = this.user;
		
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

 private statesToFields() {  
    var stateGroup =  this.ahcaFormGroup.get('state');
      this.stateGroupOptions = stateGroup!.valueChanges
      .pipe(
        startWith('Florida'),
        map(value => (<StateUsControls>stateGroup)._filterGroup(value))
      );
      console.log('hola state');
  }
 

  public ruta='/ahca-information';
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
