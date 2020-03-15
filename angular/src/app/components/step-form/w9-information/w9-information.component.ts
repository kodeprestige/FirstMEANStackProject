import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { MatCheckboxModule } from '@angular/material/checkbox';
import {MatDialog,MatDialogModule, MatDialogRef, MAT_DIALOG_DATA, MatDialogConfig} from '@angular/material';
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



export interface DialogData {
  dato1: string;
  dato2: string;
}

@Component({
  selector: 'w9-information',
  templateUrl: './w9-information.component.html',
  styleUrls: ['../step-form.component.css'],
  providers: [UserService, UploadService]
})

export class W9InformationComponent implements OnInit {

  public user; 
  public identity;
  public token;
  public message: string;
  public posr: string;
  
  dato1: string;
  dato2: string;
 
  public exemptpayeev: boolean;
  
  controls = new Controls();
  cant=1;
  
  w9FormGroup: FormGroup;

  //State USA
  stateGroupOptions: Observable<StateGroup[]>; 
  
  
  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _userService: UserService,
    private _uploadService: UploadService,
    private _formBuilder: FormBuilder,
    public dialog: MatDialog
  ){
    this.identity = this._userService.getIdentity();
    this.user = this.identity;
    this.token = this._userService.getToken();
    this.message = 'Sorry. An internal error occurred.';
      this.posr=this._userService.getTStep();
  }
  
  toggleVisibility1(e){
    let other = this.w9FormGroup.get('other').value
    
        let element = 'othert';
        this.w9FormGroup.get(element).clearValidators();
        this.w9FormGroup.get(element).setValidators(other?Validators.required:null);
        this.w9FormGroup.get(element).updateValueAndValidity();
        console.log('other'+(other?'si':'no'));
     
  }
  
  toggleVisibility2(e){
    let limited = this.w9FormGroup.get('limited').value
    
        let element = 'classification';
        this.w9FormGroup.get(element).clearValidators();
        this.w9FormGroup.get(element).setValidators(limited?Validators.required:null);
        this.w9FormGroup.get(element).updateValueAndValidity();
        console.log('classification'+(limited?'si':'no'));
     
  }
  add(){
    
    this.w9FormGroup.get('listaccountnumber'+this.cant).clearValidators();
    this.w9FormGroup.get('listaccountnumber'+this.cant).setValidators([Validators.pattern(/^(\d{10})$/),Validators.required]);
    this.w9FormGroup.get('listaccountnumber'+this.cant).updateValueAndValidity();
    this.cant++;

  }
  del(){
    this.cant--;
    this.w9FormGroup.get('listaccountnumber'+this.cant).setValue(null);
    this.w9FormGroup.get('listaccountnumber'+this.cant).clearValidators();
    this.w9FormGroup.get('listaccountnumber'+this.cant).setValidators(null);
    this.w9FormGroup.get('listaccountnumber'+this.cant).updateValueAndValidity();
  }

  toggleVisibility3(e){
    console.log('asdfghjkl');
    let exemptpayee = this.w9FormGroup.get('exemptpayee').value;
    if (e==null) {
      exemptpayee=this.exemptpayeev;
    }
    
    	if(exemptpayee) {
        let arr=['classification','tax','othert'];//los elementos no requeridos
        for( let i = 0; i < arr.length; i++){
            let element = arr[i];
            this.w9FormGroup.get(element).clearValidators();
            this.w9FormGroup.get(element).setValidators(null);
            this.w9FormGroup.get(element).updateValueAndValidity();
          }      
      }else{
        this.toggleVisibility1(e);
        this.toggleVisibility2(e);
        let arr=['tax'];//los elementos requeridos
        for( let i = 0; i < arr.length; i++){
            let element = arr[i];
            this.w9FormGroup.get(element).clearValidators();
            this.w9FormGroup.get(element).setValidators(Validators.required);
            this.w9FormGroup.get(element).updateValueAndValidity();
            // this.w9FormGroup.get(element).setPlaceholder('lolo');
          }
      }
     
  }

  

    openDialog(): void {
      
    const dialogRef = this.dialog.open(DialogW9, {
      width: '550px',    
      data: {dato1: this.dato1, dato2: this.dato2}
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      this.dato1 = result;
    });
  }

  ngOnInit() {

   this.checkStep();
   this.exemptpayeev=true;

   let namew=this.user.personal_information?this.user.personal_information.name:this.user.name;
   let miw=this.user.personal_information?this.user.personal_information.mi:(this.user.mi?this.user.mi:'');
   let last_Namew=this.user.personal_information?this.user.personal_information.last_Name:this.user.last_Name
   let present_addressw=this.user.personal_information?this.user.personal_information.present_address:this.user.present_address
   let cityw=this.user.personal_information?this.user.personal_information.city:this.user.city
   let statew=this.user.personal_information?this.user.personal_information.state:this.user.state
   let zip_codew=this.user.personal_information?this.user.personal_information.zip_code:this.user.zip_code


	 this.w9FormGroup = this._formBuilder.group({
		name: [ namew+' '+miw+' '+last_Namew , Validators.required],
		business: [''],
		address: [present_addressw, Validators.required],
		city: [cityw, Validators.required],
		state: new StateUsControls(statew), 
		zipcode: [zip_codew, [Validators.pattern(/^(\d{5})$/),Validators.required]],
		exemptpayee: [''],
    tax: [''],
		limited: [''],
		classification: [''],
		other: [''],
		othert: [''],
		listaccountnumber: ['',Validators.pattern(/^(\d{10})$/)],
    listaccountnumber1: [''],
    listaccountnumber2: ['']
    });
	
	 this.statesToFields();
   this.toggleVisibility3(null);
   
  }

 
  onSubmit(){     
    

    this.user.w9_name=this.w9FormGroup.get('name').value;
    if (this.w9FormGroup.get('business').value) {
      this.user.w9_business=this.w9FormGroup.get('business').value;
    }    
    this.user.w9_address=this.w9FormGroup.get('address').value;
    this.user.w9_city=this.w9FormGroup.get('city').value;
    this.user.w9_state=this.w9FormGroup.get('state').value;
    this.user.w9_zipcode=this.w9FormGroup.get('zipcode').value;

    this.user.w9_exemptpayee=(this.w9FormGroup.get('exemptpayee').value) ?true:false;
     if (this.user.w9_exemptpayee){

     }else {     
	 
            this.user.w9_individual=(this.w9FormGroup.get('tax').value=='1')?true:false;
            this.user.w9_ccorporation=(this.w9FormGroup.get('tax').value=='2')?true:false;
            this.user.w9_scorporation=(this.w9FormGroup.get('tax').value=='3')?true:false;
            this.user.w9_partnership= (this.w9FormGroup.get('tax').value=='4')?true:false;
            this.user.w9_trust=(this.w9FormGroup.get('tax').value=='5') ?true:false;

            this.user.w9_limited=(this.w9FormGroup.get('limited').value)?true:false;

            if (this.user.w9_limited) {
                  let limitedarr=['C','S','P'];
                  this.user.w9_classification=limitedarr[this.w9FormGroup.get('classification').value-1];                 
            }

            this.user.w9_other=(this.w9FormGroup.get('other').value)?true:false;

            if (this.user.w9_other) {                  
                  this.user.w9_othert=this.w9FormGroup.get('othert').value;                 
            }

            

    } 

    if (this.w9FormGroup.get('listaccountnumber').value) {
       this.user.w9_listaccountnumber=this.w9FormGroup.get('listaccountnumber').value;
         if (this.cant>=2) {  
           this.user.w9_listaccountnumber+=','+this.w9FormGroup.get('listaccountnumber1').value;
             if (this.cant>=3) {  
              this.user.w9_listaccountnumber+=','+this.w9FormGroup.get('listaccountnumber2').value;
            }
        }
    }
    
     
    this._userService.fillW9Information(this.user).subscribe(
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
    var stateGroup =  this.w9FormGroup.get('state');
      this.stateGroupOptions = stateGroup!.valueChanges
      .pipe(
        startWith('Florida'),
        map(value => (<StateUsControls>stateGroup)._filterGroup(value))
      );
  }
 

  public ruta='/w9-information';
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

@Component({
  selector: 'dialogw9',
  templateUrl: './dialog.component.html',
})

export class DialogW9 {

  constructor(
    public dialogRef: MatDialogRef<DialogW9>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData) {}

  onNoClick(): void {
    this.dialogRef.close();

  }

}
