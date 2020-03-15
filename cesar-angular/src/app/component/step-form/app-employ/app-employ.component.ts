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
  templateUrl: 'app-employ.component.html',
  styleUrls: ['../step-form.component.css'],
  providers: [UserService, UploadService]
})

export class AppEmployComponent implements OnInit {

  public user: User;
  public identity;
  public token;
  public message: string;

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

  contactInfFormGroup: FormGroup;

  applyForFormGroup: FormGroup;
  //Specialty
  specialties: string[];
  filteredSpecialties: Observable<string[]>;


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
  }

  ngOnInit() {
    this.piFormGroup = this._formBuilder.group({
      name: [this.user.name, Validators.required],
      mi: [this.user.mi],
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
      address2: [''],
      city: ['', Validators.required],
      state: new StateUsControls('Florida', [Validators.required, this.controls.stateUSValidator]),
      zip_code: ['', Validators.required]
    });
    //State USA
    this.statesToFields();

    this.contactInfFormGroup = this._formBuilder.group({
      phone: ['', Validators.required],
      email: [{value: this.user.email, disabled: true}, [Validators.required, Validators.email, this.controls.emailValidator]]
    });

    this.applyForFormGroup = this._formBuilder.group({
      speciality: ['', Validators.required]
    });
    //Speciality
    this.specialties = UTILS.Speciality;
    this.specialitiesToFields();

  }

  lo(){console.log("lololololo");}

  onSubmit(){
    console.log('submitting');
    console.log(this.user);

    this.user.name = this.piFormGroup.get('name').value; 
    this.user.mi = this.piFormGroup.get('mi').value; 
    this.user.lastname = this.piFormGroup.get('lastname').value;
    this.user.birthday = this.piFormGroup.get('birthday').value;
    this.user.gender = this.piFormGroup.get('gender').value; 

    this.user.address = this.addressFormGroup.get('address').value; 
    this.user.address2 = this.addressFormGroup.get('address2').value; 
    this.user.city = this.addressFormGroup.get('city').value; 
    this.user.state = this.addressFormGroup.get('state').value; 
    this.user.zip_code = this.addressFormGroup.get('zip_code').value;

    this.user.phone = this.contactInfFormGroup.get('phone').value;


    this._userService.updateUser(this.user).subscribe(
      response => {
        if(response.user && response.user._id) {

          localStorage.setItem('identity', JSON.stringify(this.user));
          this.identity = this.user;

          //Go to My data
          this._router.navigate(['/step-form']);

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
  }

  //Speciality
  private specialitiesToFields() {
    var speciality =  this.applyForFormGroup.get('speciality');
    this.filteredSpecialties = speciality.valueChanges
      .pipe(
        startWith(''),
        map(value => {
          const filterValue = value.toLowerCase();
          return this.specialties.filter(option => option.toLowerCase().includes(filterValue));
        })
      );
  }

  //Upload Doc
  @ViewChild('file') file;

  progress;
  uploading = false;
  uploadSuccessful = false;
  isComplete = false;

  docs = [
          {name: 'State License', file: null, vname: 'state_lic'},
          {name: 'Proof of Liability Insurance', file: null, vname: 'proof_of_liability_insurance'}, 
          {name: 'CPR Card', file: null, vname: 'cpr_card'}, 
          {name: 'HIV/AIDS Certificate (1 hr life time training)', file: null, vname: 'hiv_aids'},
          {name: 'OSHA Certificate (Update)', file: null, vname: 'osha'},
          {name: 'Domestic Violence Certificate', file: null, vname: 'dom_violence'},
          {name: 'Driver License', file: null, vname: 'driver_lic'},
          {name: 'Auto Insurance', file: null, vname: 'auto_insurance'},
          {name: 'Proof of Citizenship/Residency', file: null, vname: 'residency'},
          {name: 'Social Security Card', file: null, vname: 'ssc'},
          {name: 'Physical Examination (less than 12 months or new request)', file: null, vname: 'physical_exam'}
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
    });
  }

  //Message
  getEmailErrorMessage() {
      return this.controls.getEmailErrorMessage(this.contactInfFormGroup.get('email'));
  }

}
