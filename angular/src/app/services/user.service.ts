import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { GLOBAL } from './global';
import { User } from '../models/user';

@Injectable()
export class UserService {
	public identity;
	public token;
	public step=['/personal-information','/job-information','/upload-document','/emergency-information','/ahca-information','/w9-information','/pdf'];

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


	fillPersonalInformation(user: User):Observable<any>{

		let params = JSON.stringify(user);
		console.log('hola '+params);
		let headers = new HttpHeaders().set('Content-Type', 'application/json')
										.set('Authorization', this.getToken());

		return this._http.post(GLOBAL.url + 'fillPersonalInformation', params, {headers: headers});
	}

    fillJobInformation(user: User):Observable<any>{
		let params = JSON.stringify(user);
		let headers = new HttpHeaders().set('Content-Type', 'application/json')
										.set('Authorization', this.getToken());

		return this._http.post(GLOBAL.url + 'fillJobInformation/', params, {headers: headers});
	}

	fillUploadFiles(user: User):Observable<any>{
		let params = JSON.stringify(user);
		let headers = new HttpHeaders().set('Content-Type', 'application/json')
										.set('Authorization', this.getToken());

		return this._http.post(GLOBAL.url + 'fillUploadFiles/', params, {headers: headers});
	}

	fillEmergencyInformation(user: User):Observable<any>{
		let params = JSON.stringify(user);
		let headers = new HttpHeaders().set('Content-Type', 'application/json')
										.set('Authorization', this.getToken());

		return this._http.post(GLOBAL.url + 'fillEmergencyInformation/', params, {headers: headers});
	}

	fillAhcaInformation(user: User):Observable<any>{
		let params = JSON.stringify(user);
		let headers = new HttpHeaders().set('Content-Type', 'application/json')
										.set('Authorization', this.getToken());

		return this._http.post(GLOBAL.url + 'fillAhcaInformation/', params, {headers: headers});
	}
	fillW9Information(user: User):Observable<any>{
		let params = JSON.stringify(user);
		let headers = new HttpHeaders().set('Content-Type', 'application/json')
										.set('Authorization', this.getToken());

		return this._http.post(GLOBAL.url + 'fillW9Information/', params, {headers: headers});
	}

	pdf(param):Observable<any>{
		let params = JSON.stringify(param);
		let headers = new HttpHeaders().set('Content-Type', 'application/json')
										.set('Authorization', this.getToken());

		return this._http.post(GLOBAL.url + 'getPDF/',params, {headers: headers});
	}


	nextRStep(){
		let current=this.identity.complete==undefined? -1 : this.identity.complete;
		if (current+1<0 ) {return this.step[0];}
		if (current+1>=this.step.length) {return this.step[this.step.length-1];}
		return this.step[current+1];
	}

	getTStep(){
		let current=this.identity.complete==undefined? -1 : this.identity.complete;
		if (current+1<=0 ) 
			{
				current=1;
			}
		else
			{
				if (current+1>=this.step.length) 
					{
						current=this.step.length
					}
				else
					{
						current+=2;
					}
			}			
		return ('('+current+' / '+this.step.length+')');
	}

	getRStep(){
		let current=this.identity.complete==undefined? -1 : this.identity.complete;
		if (current<0 || current>=this.step.length) {return undefined}
		return this.step[current];
	}

	getPosR(ruta){
		for (var i = 0 ; i < this.step.length; i++) {
			if(this.step[i]==ruta) return i;
		}
		return -1
	}
	getPosU(){
		let current=this.identity.complete==undefined? -1 : this.identity.complete;
		if (current<0 || current>=this.step.length) {return -1}
		return current;
	}

	

}