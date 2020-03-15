import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params} from '@angular/router';
import { User } from '../../models/user';
import { UserService} from '../../services/user.service';
import { UploadService } from '../../services/upload.service';

@Component({
	selector: 'user-edit',
	templateUrl: './user-edit.component.html',
	providers: [UserService, UploadService]
})

export class UserEditComponent implements OnInit {
	
	public title: string;
	public user: User;
	public identity;
	public token;
	public status: string;
	public message: string;
	public urlImage: string;

	constructor(
		private _route: ActivatedRoute,
		private _router: Router,
		private _userService: UserService,
		private _uploadService: UploadService
	) {
		this.title = 'Edit user';
		this.identity = this._userService.getIdentity();
		this.user = this.identity;
		this.token = this._userService.getToken();
		//this.urlImage = (this.user.image)? this._userService.getImage(this.user): '../../favicon.ico';
	}

	ngOnInit(){
		console.log("User Edit loaded");
	}

	onSubmit(){
		console.log(this.user);
		this._userService.updateUser(this.user).subscribe(
			response => {
				if(response.user && response.user._id) {
					this.status = 'success';
					localStorage.setItem('identity', JSON.stringify(this.user));
					this.identity = this.user;

					//Upload Image
					/*if(this.filesToUpload && this.filesToUpload.length > 0) {
						this._uploadService.makeFileRequest('upload-image-user/' + this.user._id, [], this.filesToUpload, this.token, 'image')
											.then((result: any) => {
												this.filesToUpload = null;
												console.log(result);
												//this.user.image = result.user.image;
												//this.urlImage = this._userService.getImage(this.user);
												localStorage.setItem('identity', JSON.stringify(this.user));
												this.identity = this.user;
											})
											.catch(err => {
												this.status = 'error';
												console.log(err);

												if(err && (this.message = err.error.message)) {
													if(this.message != 'File is not an image.' && this.message != 'Permission denied') {
														console.log(this.message);
														this.message = 'Try again.';
													}
												} else {
													this.message = 'Try again.';
												}
											});
					}*/
					//-----------------------

				} else {
					this.status = 'error';
					this.message = 'Try again.';
				}
			},
			err => {
				this.status = 'error';
				console.log(err);

				if(err && (this.message = err.error.message)) {
					if(this.message != 'Nickname already exists.' && this.message != 'Email already exists.' && this.message != 'Permission denied') {
						console.log(this.message);
						this.message = 'Try again.';
					}
				} else {
					this.message = 'Try again.';
				}
			}
		);
	}

	public filesToUpload: Array<File>;
	fileChangeEvent(fileInput: any) {
		this.filesToUpload = <Array<File>>fileInput.target.files;
	}
}