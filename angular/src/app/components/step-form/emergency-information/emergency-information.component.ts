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
  selector: 'emergency-information',
  templateUrl: './emergency-information.component.html',
  styleUrls: ['../step-form.component.css'],
  providers: [UserService, UploadService]
})

export class EmergencyInformationComponent implements OnInit {

  public user: User;
  public identity;
  public token;
  public message: string;
  public marcado:boolean;
  public posr: string;

  controls = new Controls();

  //relationship
  relationship1: string[];
  relationship2: string[];
  filteredrelationship1: Observable<string[]>;
  filteredrelationship2: Observable<string[]>;

  
  //State USA
  stateGroupOptions1: Observable<StateGroup[]>;
  stateGroupOptions2: Observable<StateGroup[]>;

  ceFormGroup: FormGroup;

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

    this.ceFormGroup = this._formBuilder.group({
        name: ['', Validators.required],
        lastname: ['', Validators.required],
        mi: [''],
        relationship:['', Validators.required],
        address: ['', Validators.required],
        city: ['', Validators.required],
        state: new StateUsControls('Florida', [Validators.required, this.controls.stateUSValidator]),
        zip_code: ['',[Validators.pattern(/^(\d{5})$/),Validators.required]],
        phone: ['', [Validators.pattern(/^(\d{10})$/),Validators.required]],
        name2: ['', Validators.required],
        lastname2: ['', Validators.required],
        mi2: [''],
        relationship2:['', Validators.required],
        address2: ['', Validators.required],
        city2: ['', Validators.required],
        state2: new StateUsControls('Florida', [Validators.required, this.controls.stateUSValidator]),
        zip_code2: ['',[Validators.pattern(/^(\d{5})$/),Validators.required]],
        phone2: ['', [Validators.pattern(/^(\d{10})$/),Validators.required]]
    });
     //relationship
    this.relationship1 = UTILS.Relationship;
    this.relationship2 = UTILS.Relationship;
    this.relationshipToFields();
    
    //State USA
    this.statesToFields();

  }

  lo(){console.log("lololololo");}

  onSubmit(){
    console.log("lololololo");
      this.user.contact_emergency_name=this.ceFormGroup.get('name').value;
      this.user.contact_emergency_last_name=this.ceFormGroup.get('lastname').value;
      this.user.contact_emergency_mi=this.ceFormGroup.get('mi').value;
      this.user.contact_emergency_relationship=this.ceFormGroup.get('relationship').value;
      this.user.contact_emergency_address=this.ceFormGroup.get('address').value;
      this.user.contact_emergency_city=this.ceFormGroup.get('city').value;
      this.user.contact_emergency_state =this.ceFormGroup.get('state').value; 
      this.user.contact_emergency_zip_code=this.ceFormGroup.get('zip_code').value;
      this.user.contact_emergency_phone=this.ceFormGroup.get('phone').value;
      this.user.contact_emergency_name2=this.ceFormGroup.get('name2').value;
      this.user.contact_emergency_last_name2=this.ceFormGroup.get('lastname2').value;
      this.user.contact_emergency_mi2=this.ceFormGroup.get('mi2').value;
      this.user.contact_emergency_relationship2 =this.ceFormGroup.get('relationship2').value; 
      this.user.contact_emergency_address2 =this.ceFormGroup.get('address2').value; 
      this.user.contact_emergency_city2=this.ceFormGroup.get('city2').value;
      this.user.contact_emergency_state2 =this.ceFormGroup.get('state2').value; 
      this.user.contact_emergency_zip_code2 =this.ceFormGroup.get('zip_code2').value; 
      this.user.contact_emergency_phone2 =this.ceFormGroup.get('phone2').value; 

      this._userService.fillEmergencyInformation(this.user).subscribe(
        response => {
          if(response.next) {
			     this.user.complete++;
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
          console.log(this.user);

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
    var stateGroup1 =  this.ceFormGroup.get('state');
    this.stateGroupOptions1 = stateGroup1!.valueChanges
      .pipe(
        startWith('Florida'),
        map(value1 => (<StateUsControls>stateGroup1)._filterGroup(value1))
      );
    var stateGroup2 =  this.ceFormGroup.get('state2');
    this.stateGroupOptions2 = stateGroup2!.valueChanges
      .pipe(
        startWith('Florida'),
        map(value2 => (<StateUsControls>stateGroup2)._filterGroup(value2))
      );
  }


 

 
  
  public ruta='/emergency-information';
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


  private relationshipToFields() {
    var relationship1form =  this.ceFormGroup.get('relationship');
    this.filteredrelationship1 = relationship1form.valueChanges
    .pipe(
        startWith(''),
        map(value => {
          const filterValue = value.toLowerCase();
          return this.relationship1.filter(option => option.toLowerCase().includes(filterValue));
        })
      );
      var relationship2form =  this.ceFormGroup.get('relationship2');
    this.filteredrelationship2 = relationship2form.valueChanges
    .pipe(
        startWith(''),
        map(value => {
          const filterValue = value.toLowerCase();
          return this.relationship2.filter(option => option.toLowerCase().includes(filterValue));
        })
      );
  }

}
