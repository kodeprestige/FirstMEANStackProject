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
  selector: 'upload-document',
  templateUrl: './upload-document.component.html',
  styleUrls: ['../step-form.component.css'],
  providers: [UserService, UploadService]
})

export class UploadDocumentComponent implements OnInit {

  public user: User; 
  public identity;
  public token;
  public message: string;
  public pdfresume;
  public posr: string;
//Date 
  minDate: Date;
  maxDate: Date;  
  leveselected: Number;
  
  controls = new Controls();
  


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
  }
  onSubmit(){   
    
     this.upLoad()    
     
  }


  //Upload Doc
  @ViewChild('file') file;

  progress;
  uploading = false;
  uploadSuccessful = false;
  isComplete = false;

  docs = [
          {name: 'State License *', file: null, vname: 'state_lic'},
          {name: 'Proof of Liability Insurance *', file: null, vname: 'proof_of_liability_insurance'}, 
          {name: 'CPR Card *', file: null, vname: 'cpr_card'}, 
          {name: 'HIV/AIDS Certificate (1 hr life time training) *', file: null, vname: 'hiv_aids'},
          {name: 'OSHA Certificate (Update) *', file: null, vname: 'osha'},
          {name: 'Domestic Violence Certificate *', file: null, vname: 'dom_violence'},
          {name: 'Driver License *', file: null, vname: 'driver_lic'},
          {name: 'Auto Insurance *', file: null, vname: 'auto_insurance'},
          {name: 'Proof of Citizenship/Residency *', file: null, vname: 'residency'},
          {name: 'Social Security Card *', file: null, vname: 'ssc'},
          {name: 'Physical Examination (less than 12 months or new request) *', file: null, vname: 'physical_exam'}
        ];

        

  docsCount = 0;
  
  tmp: { name: string, file: File, vname: string };
  addFile(doc: { name: string, file: File, vname: string }) {
    this.tmp = doc;
    this.file.nativeElement.click();
  }

  onFileAdded() {
    if (!this.tmp.file) {
      this.isComplete = ++this.docsCount == this.docs.length;
    }
    this.tmp.file = this.file.nativeElement.files[0];
    console.log('here');
  }

  upLoad() {

    // start the upload and save the progress map
    if (!(this.progress = this._uploadService.upload(this.user._id, this.docs))) {
      return;
    }

    // set the component state to "uploading"
    this.uploading = true;

    // convert the progress map into an array
    let allProgressObservables = [];
    for (let key in this.progress) {
      allProgressObservables.push(this.progress[key].progress);
    }

    // Adjust the state variables

    // When all progress-observables are completed...
    forkJoin(allProgressObservables).subscribe(end => {

      // ... the upload was successful...
      this.uploadSuccessful = true;

      // ... and the component is no longer uploading
      this.uploading = false;
      
      this._userService.fillUploadFiles(this.user).subscribe(
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


    
    });
  }

  public ruta='/upload-document';
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
