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
  selector: 'job-information',
  templateUrl: './job-information.component.html',
  styleUrls: ['../step-form.component.css'],
  providers: [UserService, UploadService]
})

export class JobInformationComponent implements OnInit {

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
  ehFormGroup: FormGroup; 
  eiFormGroup: FormGroup;  
  applyForFormGroup: FormGroup;
  myGroup: FormGroup;
  myGroup2: FormGroup;
  //Specialty
  specialties: string[];
  filteredSpecialties: Observable<string[]>;


   //State USA
  stateGroupOptions1: Observable<StateGroup[]>;
  stateGroupOptions2: Observable<StateGroup[]>;
  stateGroupOptions3: Observable<StateGroup[]>;
  stateGroupOptions4: Observable<StateGroup[]>;
  stateGroupOptions5: Observable<StateGroup[]>;
  stateGroupOptions6: Observable<StateGroup[]>;
  stateGroupOptions7: Observable<StateGroup[]>;
  
  //State USA
  private statesToFields() {  
    var stateGroup1 =  this.eiFormGroup.get('state1');
    var stateGroup2 =  this.eiFormGroup.get('state2');
    var stateGroup3 =  this.eiFormGroup.get('state3');
    var stateGroup4 =  this.eiFormGroup.get('state4');
    var stateGroup5 =  this.ehFormGroup.get('state1');
    var stateGroup6 =  this.ehFormGroup.get('state2');
    var stateGroup7 =  this.ehFormGroup.get('state3');

      this.stateGroupOptions1 = stateGroup1!.valueChanges
      .pipe(
        startWith('Florida'),
        map(value => (<StateUsControls>stateGroup1)._filterGroup(value))
      );
      this.stateGroupOptions2 = stateGroup2!.valueChanges
      .pipe(
        startWith('Florida'),
        map(value => (<StateUsControls>stateGroup2)._filterGroup(value))
      );
      this.stateGroupOptions3 = stateGroup3!.valueChanges
      .pipe(
        startWith('Florida'),
        map(value => (<StateUsControls>stateGroup3)._filterGroup(value))
      );
      this.stateGroupOptions4 = stateGroup4!.valueChanges
      .pipe(
        startWith('Florida'),
        map(value => (<StateUsControls>stateGroup4)._filterGroup(value))
      );
      this.stateGroupOptions5 = stateGroup5!.valueChanges
      .pipe(
        startWith('Florida'),
        map(value => (<StateUsControls>stateGroup5)._filterGroup(value))
      );
      this.stateGroupOptions6 = stateGroup6!.valueChanges
      .pipe(
        startWith('Florida'),
        map(value => (<StateUsControls>stateGroup6)._filterGroup(value))
      );
      this.stateGroupOptions7 = stateGroup7!.valueChanges
      .pipe(
        startWith('Florida'),
        map(value => (<StateUsControls>stateGroup7)._filterGroup(value))
      );
  }

  leveleducation=[
  {show:"GRAMMAR SCHOOL",value:"1"},
  {show:"HIGH SCHOOL",value:"2"},
  {show:"COLLEGE",value:"3"},
  {show:"TRADE, OTHER SCHOOL",value:"4"}
  ];

   step1 = 0;

    setStep1(index: number) {
      this.step1 = index;
    }

    nextStep1() {
      this.step1++;
    }

    prevStep1() {
      this.step1--;
    }

    step2 = 0;
    work = 0;

    setStep2(index: number) {
      this.step2 = index;
    }

    nextStep2() {
      this.step2++;
    }

    prevStep2() {
      this.step2--;
    }

    add() {
      this.work++;
      this.step2++;
	  this.jobrequiered(this.work+1,true);
    }

    del() {
	  this.jobrequiered(this.work+1,false);
      this.work--;
      this.step2--;
	  
    }

     selectedlevel(e){
      
        var selcted = this.eiFormGroup.get('leveselected').value;
        var lv=['nameschool','address','city','state','yearsattended','subjectstudied'];
      
        for( let l = 1; l < 5; l++){
          for( let i = 0; i < lv.length; i++){
              let element = lv[i]+''+l;
             
              this.eiFormGroup.get(element).clearValidators();              
              this.eiFormGroup.get(element).setValidators((l<=selcted)?Validators.required:null);             
              this.eiFormGroup.get(element).updateValueAndValidity();
            }
             let element='zipcode'+''+l;
              this.eiFormGroup.get(element).clearValidators();             
              this.eiFormGroup.get(element).setValidators((l<=selcted)?[Validators.pattern(/^(\d{5})$/),Validators.required]:null);             
              this.eiFormGroup.get(element).updateValueAndValidity();
        }
    }
	
	jobrequiered(num,op){		     
        var job=['from','to','nameemployer','address','city','state','position','reasonleaving','attention'];
		          
          for( let i = 0; i < job.length; i++){
              let element = job[i]+''+num;
            
              this.ehFormGroup.get(element).clearValidators();              
              this.ehFormGroup.get(element).setValidators((op)?Validators.required:null);              
              this.ehFormGroup.get(element).updateValueAndValidity();
            }   
         let element='zipcode'+''+num;
          this.ehFormGroup.get(element).clearValidators();             
          this.ehFormGroup.get(element).setValidators((op)?[Validators.pattern(/^(\d{5})$/),Validators.required]:null);             
          this.ehFormGroup.get(element).updateValueAndValidity();     
    }

    resumechange(e){
      
      let checkbox = this.ehFormGroup.get('resume').value
    
      this.jobrequiered(1,!checkbox);

      let element='resumepdf';
      
      this.ehFormGroup.get(element).clearValidators();             
      this.ehFormGroup.get(element).setValidators((checkbox)?Validators.required:null);             
      this.ehFormGroup.get(element).updateValueAndValidity();  
 
     
  }


     //Upload Doc
  @ViewChild('file') file;

  progress;
  uploading = false;
  uploadSuccessful = false;
  isComplete = false;

  docs = [
          {name: 'Resume PDF', file: null, vname: 'pdfresume'}
        ];
	
	docsCount = 0;
  
  tmp: { name: string, file: File, vname: string };
  addFile(doc: { name: string, file: File, vname: string }) {
    let element='resumepdf';
    this.ehFormGroup.get(element).clearValidators();             
    this.ehFormGroup.get(element).setValidators(null);             
    this.ehFormGroup.get(element).updateValueAndValidity();

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
    //if (this.user.complete=="job_information") {this._router.navigate(['/emergency-information']);}
    
    this.myGroup = this._formBuilder.group({
      leveselected: ['', Validators.required]
    });
    

    this.applyForFormGroup = this._formBuilder.group({
      speciality: ['', Validators.required]
    });
    
    //Speciality
    this.specialties = UTILS.Speciality;
    this.specialitiesToFields();
    
    this.eiFormGroup = this._formBuilder.group({
      leveselected: [''],
      nameschool1: [''],
      address1: [''],
      city1: [''],
      state1: new StateUsControls('Florida'),
      zipcode1: [''],
      yearsattended1: [''],
      subjectstudied1: [''],
      nameschool2: [''],
      address2: [''],
      city2: [''],
      state2: new StateUsControls('Florida'),
      zipcode2: [''],
      yearsattended2: [''],
      subjectstudied2: [''],
      nameschool3: [''],
      address3: [''],
      city3: [''],
      state3: new StateUsControls('Florida'),
      zipcode3: [''],
      yearsattended3: [''],
      subjectstudied3: [''],
      nameschool4: [''],
      address4: [''],
      city4: [''],
      state4: new StateUsControls('Florida'),
      zipcode4: [''],
      yearsattended4: [''],
      subjectstudied4: [''],
    });
    
    this.ehFormGroup = this._formBuilder.group({
      resume: [''],
      resumepdf: [''],
      from1: [''],
      to1: [''],
      nameemployer1: [''],
      address1: [''],
      city1: [''],
      state1: new StateUsControls('Florida'), 
      zipcode1: [''],
      position1: [''],
      reasonleaving1: [''],
      attention1: [''],
      phone1:['', Validators.pattern(/^(\d{10})$/)],
      fax1: ['', Validators.pattern(/^(\d{10})$/)],
      from2: [''],
      to2: [''],
      nameemployer2: [''],
      address2: [''],
      city2: [''],
      state2: new StateUsControls('Florida'),
      zipcode2: [''],
      position2: [''],
      reasonleaving2: [''],
      attention2: [''],
      phone2:['', Validators.pattern(/^(\d{10})$/)],
      fax2: ['', Validators.pattern(/^(\d{10})$/)],
      from3: [''],
      to3: [''],
      nameemployer3: [''],
      address3: [''],
      city3: [''],
      state3: new StateUsControls('Florida'),
      zipcode3: [''],
      position3: [''],
      reasonleaving3: [''],
      attention3: [''],
      phone3:['', Validators.pattern(/^(\d{10})$/)],
      fax3:['', Validators.pattern(/^(\d{10})$/)],
     
    });
	this.statesToFields();
	this.jobrequiered(1,true);
  }



  lo(){console.log("lololololo");}

  onSubmit(){
    console.log('submitting');
    console.log(''+this.eiFormGroup.get('leveselected').value);
    console.log(this.user);

 
    this.user.applaying_job = this.applyForFormGroup.get('speciality').value; 

    console.log(''+this.eiFormGroup.get('leveselected').value);

    if (this.eiFormGroup.get('leveselected').value>0) {

        this.user.lv1_name_of_school = this.eiFormGroup.get('nameschool1').value;
        this.user.lv1_address = this.eiFormGroup.get('address1').value;
        this.user.lv1_city = this.eiFormGroup.get('city1').value;
        this.user.lv1_state = this.eiFormGroup.get('state1').value;
        this.user.lv1_zipcode = this.eiFormGroup.get('zipcode1').value;
        this.user.lv1_years_attended = this.eiFormGroup.get('yearsattended1').value; 
        this.user.lv1_subject_studied = this.eiFormGroup.get('subjectstudied1').value;

              if (this.eiFormGroup.get('leveselected').value>1) {

                    this.user.lv2_name_of_school = this.eiFormGroup.get('nameschool2').value;
                    this.user.lv2_address = this.eiFormGroup.get('address2').value;
                    this.user.lv2_city = this.eiFormGroup.get('city2').value;
                    this.user.lv2_state = this.eiFormGroup.get('state2').value;
                    this.user.lv2_zipcode = this.eiFormGroup.get('zipcode2').value;
                    this.user.lv2_years_attended = this.eiFormGroup.get('yearsattended2').value; 
                    this.user.lv2_subject_studied = this.eiFormGroup.get('subjectstudied2').value;

                          if (this.eiFormGroup.get('leveselected').value>2) {

                                  this.user.lv3_name_of_school = this.eiFormGroup.get('nameschool3').value;
                                  this.user.lv3_address = this.eiFormGroup.get('address3').value;
                                  this.user.lv3_city = this.eiFormGroup.get('city3').value;
                                  this.user.lv3_state = this.eiFormGroup.get('state3').value;
                                  this.user.lv3_zipcode = this.eiFormGroup.get('zipcode3').value;
                                  this.user.lv3_years_attended = this.eiFormGroup.get('yearsattended3').value; 
                                  this.user.lv3_subject_studied = this.eiFormGroup.get('subjectstudied3').value;

                                  if (this.eiFormGroup.get('leveselected').value>3) {

                                        this.user.lv4_name_of_school = this.eiFormGroup.get('nameschool4').value;
                                        this.user.lv4_address = this.eiFormGroup.get('address4').value;
                                        this.user.lv4_city = this.eiFormGroup.get('city4').value;
                                        this.user.lv4_state = this.eiFormGroup.get('state4').value;
                                        this.user.lv4_zipcode = this.eiFormGroup.get('zipcode4').value;
                                        this.user.lv4_years_attended = this.eiFormGroup.get('yearsattended4').value; 
                                        this.user.lv4_subject_studied = this.eiFormGroup.get('subjectstudied4').value;
                                  }
                          }

              }

    }

    
    
    this.user.resume = this.ehFormGroup.get('resume').value;

    if (this.user.resume) {
      this.work=-1;
      this.upLoad();     
    }
    

    if (this.work>=0) {
    this.user.work1_from = this.ehFormGroup.get('from1').value;
    this.user.work1_to = this.ehFormGroup.get('to1').value;
    this.user.work1_name_of_employer = this.ehFormGroup.get('nameemployer1').value;
    this.user.work1_address = this.ehFormGroup.get('address1').value;
    this.user.work1_city = this.ehFormGroup.get('city1').value;
    this.user.work1_state = this.ehFormGroup.get('state1').value;
    this.user.work1_zipcode = this.ehFormGroup.get('zipcode1').value;
    this.user.work1_position = this.ehFormGroup.get('position1').value;
    this.user.work1_reason_for_leaving = this.ehFormGroup.get('reasonleaving1').value;
    this.user.work1_attention = this.ehFormGroup.get('attention1').value?this.ehFormGroup.get('attention1').value:"";
    this.user.work1_phone = this.ehFormGroup.get('phone1').value?this.ehFormGroup.get('phone1').value:"";
    this.user.work1_fax = this.ehFormGroup.get('fax1').value?this.ehFormGroup.get('fax1').value:"";
       if (this.work>=1) {
          this.user.work2_from = this.ehFormGroup.get('from2').value;
          this.user.work2_to = this.ehFormGroup.get('to2').value;
          this.user.work2_name_of_employer = this.ehFormGroup.get('nameemployer2').value;
          this.user.work2_address = this.ehFormGroup.get('address2').value;
          this.user.work2_city = this.ehFormGroup.get('city2').value;
          this.user.work2_state = this.ehFormGroup.get('state2').value;
          this.user.work2_zipcode = this.ehFormGroup.get('zipcode2').value;
          this.user.work2_position = this.ehFormGroup.get('position2').value;
          this.user.work2_reason_for_leaving = this.ehFormGroup.get('reasonleaving2').value;
          this.user.work2_attention = this.ehFormGroup.get('attention2').value?this.ehFormGroup.get('attention2').value:"";
          this.user.work2_phone = this.ehFormGroup.get('phone2').value?this.ehFormGroup.get('phone2').value:"";
          this.user.work2_fax = this.ehFormGroup.get('fax2').value?this.ehFormGroup.get('fax2').value:"";
                 if (this.work>=2) {
                  this.user.work3_from = this.ehFormGroup.get('from3').value;
                  this.user.work3_to = this.ehFormGroup.get('to3').value;
                  this.user.work3_name_of_employer = this.ehFormGroup.get('nameemployer3').value;
                  this.user.work3_address = this.ehFormGroup.get('address3').value;
                  this.user.work3_city = this.ehFormGroup.get('city3').value;
                  this.user.work3_state = this.ehFormGroup.get('state3').value;
                  this.user.work3_zipcode = this.ehFormGroup.get('zipcode3').value;
                  this.user.work3_position = this.ehFormGroup.get('position3').value;
                  this.user.work3_reason_for_leaving = this.ehFormGroup.get('reasonleaving3').value;
                  this.user.work3_attention = this.ehFormGroup.get('attention3').value?this.ehFormGroup.get('attention3').value:"";
                  this.user.work3_phone = this.ehFormGroup.get('phone3').value?this.ehFormGroup.get('phone3').value:"";
                  this.user.work3_fax = this.ehFormGroup.get('fax3').value?this.ehFormGroup.get('fax3').value:"";
                  }
          }
    }
     
    this._userService.fillJobInformation(this.user).subscribe(
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

  

  public ruta='/job-information';
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
