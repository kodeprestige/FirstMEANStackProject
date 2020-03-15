import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef } from '@angular/material';
import { UploadService } from './upload.service';
import { forkJoin } from 'rxjs/observable/forkJoin';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.css']
})
export class UploadComponent {
	@ViewChild('file') file;
  	public files: File[];

	progress;
	uploading = false;
	uploadSuccessful = false;
	arr = [{name: 'ar1', file: File}, {name: 'ar2', file: File}];

	tmp: {name: string, file: File};

  	constructor(private uploadService: UploadService) {
  		console.log(this.arr[0]);
  	}

  	/*addFiles(a: { name: string, file: File}) {
  		this.tmp = a;
  		this.file.nativeElement.click();
  		console.log(this.tmp);
  	}

  	onFilesAdded() {
  		const files: { [key: string]: File } = this.file.nativeElement.files;
  		console.log("1"+this.file.nativeElement.files);
		for (let key in files) {
	    	if (!isNaN(parseInt(key))) {
	    		console.log("key:"+key);
	      		this.files.add(files[key]);
	    	}
	  	}
  	}

  	onFileAdded() {
  		this.tmp.file = this.file.nativeElement.files[0];
  		console.log(this.tmp.file.name);
  		console.log(this.tmp);
  	}

  	upLoad() {

	  	// set the component state to "uploading"
	  	this.uploading = true;

	  	// start the upload and save the progress map
	  	this.progress = this.uploadService.upload(this.files);

		// convert the progress map into an array
		let allProgressObservables = [];
		for (let key in this.progress) {
	    	allProgressObservables.push(this.progress[key].progress);
	  	}

	  	// Adjust the state variables

	  	// The OK-button should have the text "Finish" now
	  	this.primaryButtonText = 'Finish';

	  	// The dialog should not be closed while uploading
	  	this.canBeClosed = false;

	  	// Hide the cancel-button
	  	this.showCancelButton = false;

	  	// When all progress-observables are completed...
	  	forkJoin(allProgressObservables).subscribe(end => {
	    	// ... the dialog can be closed again...
	    	this.canBeClosed = true;

	    	// ... the upload was successful...
	    	this.uploadSuccessful = true;

	    	// ... and the component is no longer uploading
	    	this.uploading = false;
	  	});
	}*/

}

