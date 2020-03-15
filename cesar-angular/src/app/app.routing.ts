import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Components
import { HomeComponent } from './component/home/home.component';
import { LoginComponent } from './component/login/login.component';
import { RegisterComponent } from './component/register/register.component';
import { UserEditComponent } from './component/user-edit/user-edit.component';
import { UploadComponent } from './component/upload/upload.component';
import { StepperComponent } from './component/step-form/step-form.component';

const appRoutes: Routes = [
	{path: '', redirectTo: '/home', pathMatch: 'full'},
	//{path: 'home', component: HomeComponent},
	{path: 'home', component: LoginComponent},
	{path: 'register', component: RegisterComponent},
	{path: 'user-edit', component: UserEditComponent},
	{path: 'upload-doc', component: UploadComponent},
	{path: 'step-form', component: StepperComponent}
];

export const appRoutingProviders: any[] = [];
export const routing: ModuleWithProviders = RouterModule.forRoot(appRoutes);