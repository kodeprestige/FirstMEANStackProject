import { Component, ViewEncapsulation, OnInit, DoCheck } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { UserService } from '../../../services/user.service';

@Component({
  selector: 'app-nav-list',
  templateUrl: './nav-list.component.html',
  providers: [UserService]
})
export class NavListComponent implements OnInit, DoCheck {

  public title:string;
  public identity;
  public urlImage;

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _userService: UserService
  ){
    this.title = 'Concepts In Eldercare';
    this.urlImage = (this.identity && this.identity.image)? this._userService.getImage(this.identity): '../../favicon.ico';
  }

  logout(){
    localStorage.clear();
    this.identity = null;
    this._router.navigate(['/']); 
  }

  ngOnInit(){
    this.identity = this._userService.getIdentity();
  }

  ngDoCheck(){
    this.identity = this._userService.getIdentity();
    this.urlImage = (this.identity && this.identity.image)? this._userService.getImage(this.identity): '../../favicon.ico';
  }

}

}
