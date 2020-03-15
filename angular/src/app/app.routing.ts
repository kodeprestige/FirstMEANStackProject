import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Components
import { LoginComponent } from './components/login/login.component';
import { UploadComponent } from './components/upload/upload.component';
import { AppEmployComponent } from './components/step-form/app-employ/app-employ.component';
import { JobInformationComponent } from './components/step-form/job-information/job-information.component';
import { EmergencyInformationComponent } from './components/step-form/emergency-information/emergency-information.component';
import { AhcaInformationComponent } from './components/step-form/ahca-information/ahca-information.component';
import { W9InformationComponent } from './components/step-form/w9-information/w9-information.component';
import { DialogW9 } from './components/step-form/w9-information/w9-information.component';
import { PdfComponent } from './components/step-form/pdf/pdf.component';
import { UploadDocumentComponent } from './components/step-form/upload-document/upload-document.component';


const appRoutes: Routes = [
	{path: '', redirectTo: '/home', pathMatch: 'full'},
	{path: 'home', component: LoginComponent},
	{path: 'upload-doc', component: UploadComponent},
	{path: 'personal-information', component: AppEmployComponent},
	{path: 'job-information', component: JobInformationComponent},
	{path: 'emergency-information', component: EmergencyInformationComponent},
	{path: 'ahca-information', component: AhcaInformationComponent},
	{path: 'w9-information', component: W9InformationComponent},
	{path: 'upload-document', component: UploadDocumentComponent},
	{path: 'pdf', component: PdfComponent}	
];

export const appRoutingProviders: any[] = [];
export const routing: ModuleWithProviders = RouterModule.forRoot(appRoutes);