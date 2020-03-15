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
  selector: 'pdf-form',
  templateUrl: './pdf.component.html',
  styleUrls: ['../step-form.component.css'],
  providers: [UserService, UploadService]
})

export class PdfComponent implements OnInit {

  public user: User;
  public identity;
  public token;
  public message: string;
  public marcado:boolean;
  public posr: string;

  page: number = 1;
  totalPages: number;
  isLoaded: boolean = false;

  controls = new Controls();

   pdfs=[
  {show:"APPLICATION CONTRACTOR",value:"3"}
  ];

 
  pdfForFormGroup: FormGroup;


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
    this.pdfForFormGroup = this._formBuilder.group({
      pdfselected: ['', Validators.required]
    });
    
  }

  afterLoadComplete(pdfData: any) {
    this.totalPages = pdfData.numPages;
    this.isLoaded = false;
  }

  nextPage() {
    this.page++;
  }

  prevPage() {
    this.page--;
}


  lo(){console.log("lololololo");}

  onSubmit(){
    
   
   //var params:{pdf:'"'+this.pdfForFormGroup.get('pdfselected').value+'"'};
    this.user.pdfselected=this.pdfForFormGroup.get('pdfselected').value;

console.log(this.user);
    this._userService.pdf(this.user).subscribe(      
      response => {
        console.log("response por dentro 2 :"+JSON.stringify(response));        
      },
      err => {
        if(err && (this.message = err.error.message)) {
          console.log(err.error.message);
        } else {
          this.message = 'Try again.';
        }
      }
    );
  }

  public ruta='/pdf';
  checkStep(){
      let posthisruting=this._userService.getPosR(this.ruta);//posiscion de la ruta actual a llenar
      let posthisuser=this._userService.getPosU();//posiscion de la ultima ruta que completo el usuario     

      if (posthisruting==posthisuser+1) {return;}
      
          let nextpos=this._userService.nextRStep();                
          return this._router.navigate([nextpos]); 
      
    }

  


}
