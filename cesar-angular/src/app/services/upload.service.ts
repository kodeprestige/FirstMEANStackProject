import { Injectable } from '@angular/core';
import { GLOBAL } from './global';

@Injectable()
export class UploadService {
	public url: string;

	constructor() {
		this.url = GLOBAL.url;
	}

	makeFileRequest(url: string, params: Array<string>, files: Array<File>, token: string, name: string) {
		return new Promise((resolve, reject) => {
			const formData: any = new FormData();
			var xhr = new XMLHttpRequest();

			for (let file of files) {
				formData.append(name, file, file.name);
			}

			xhr.onreadystatechange = () => {
				if (xhr.readyState == 4) {
					if(xhr.status == 200) { //Error code 200
						resolve(JSON.parse(xhr.response));
					} else {
						reject(xhr.response);
					}
				}
			}

			xhr.open('POST', this.url + url, true);
			xhr.setRequestHeader('Authorization', token);
			xhr.send(formData);
		});
	}
}