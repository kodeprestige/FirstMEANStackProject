import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { GLOBAL } from './global';
import { User } from '../models/user';

@Injectable()
export class UserService {
	public identity;
	public token;

	constructor(public _http: HttpClient) {}

	register(user: User): Observable<any> {
		let params = JSON.stringify(user);
		let headers = new HttpHeaders().set('Content-Type', 'application/json');

		return this._http.post(GLOBAL.url + 'register', params, {headers: headers});
	}

	singup(user, gettoken = false): Observable<any> {
		user.gettoken = gettoken;

		let params = JSON.stringify(user);
		let headers = new HttpHeaders().set('Content-Type', 'application/json');

		return this._http.post(GLOBAL.url + 'login', params, {headers: headers});
	}

	getIdentity(){
		let identity = JSON.parse(localStorage.getItem('identity'));

		return this.identity = (identity != "undefined")? identity: null;

	}

	getToken(){
		let token = localStorage.getItem('token');

		return this.token = (token != "undefined")? token: null;

	}

	updateUser(user: User): Observable<any>{
		let params = JSON.stringify(user);
		let headers = new HttpHeaders().set('Content-Type', 'application/json')
										.set('Authorization', this.getToken());

		return this._http.put(GLOBAL.url + 'update-user/' + user._id, params, {headers: headers});
	}

	/*getImage(user: User): string {
		console.log(this.url + 'get-image-user/' + user.image);
		return this.url + 'get-image-user/' + user.image;
	}*/

}