import { Component } from '@angular/core';

@Component({
	selector: 'test',
	templateUrl: './test.component.html'
})

export class TestComponent {
	public name:string;
	public typeTemplate:string;
	public typeHome:string;
	public flag:boolean;
	public colorRed:string;
	public colorBlue:string;
	public types:Array<string>;

	constructor(){
		this.name = 'Cesar Proy';
		this.typeTemplate = 'Template';
		this.typeHome = 'Home';
		this.flag = false;
		this.colorRed = "red";
		this.colorBlue = "blue";
		this.types = [
			'Home',
			'Template',
			'Nurse',
			'Assistent'
		];
	}

}