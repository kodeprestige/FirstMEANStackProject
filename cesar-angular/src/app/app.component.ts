import { Component, ViewEncapsulation, OnInit, DoCheck } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { UserService } from './services/user.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [UserService],
  encapsulation: ViewEncapsulation.None
})

export class AppComponent implements OnInit, DoCheck {
  public identity;

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _userService: UserService
  ){
  }

  ngOnInit(){
    this.identity = this._userService.getIdentity();
    //console.log(this.identity);
  }

  ngDoCheck(){
    this.identity = this._userService.getIdentity();
    //console.log(this.identity);
  }

}