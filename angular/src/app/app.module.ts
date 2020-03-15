import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PdfViewerModule } from 'ng2-pdf-viewer';



//Routes
import { routing, appRoutingProviders } from './app.routing';

// Components
import { AppComponent } from './app.component';
import { LoginComponent } from './components/login/login.component';
import { UploadDocComponent } from './components/upload-doc/upload-doc.component';
import { AppEmployComponent } from './components/step-form/app-employ/app-employ.component';
import { JobInformationComponent } from './components/step-form/job-information/job-information.component';
import { EmergencyInformationComponent } from './components/step-form/emergency-information/emergency-information.component';
import { AhcaInformationComponent } from './components/step-form/ahca-information/ahca-information.component';
import { W9InformationComponent } from './components/step-form/w9-information/w9-information.component';
import { DialogW9 } from './components/step-form/w9-information/w9-information.component';
import { PdfComponent } from './components/step-form/pdf/pdf.component';
import { UploadDocumentComponent } from './components/step-form/upload-document/upload-document.component';


import { FlexLayoutModule } from "@angular/flex-layout";

//Angular Material
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {
  MatButtonModule,
  MatIconModule,
  MatListModule,
  MatSidenavModule,
  MatToolbarModule,
  MatCardModule,
  MatFormFieldModule,
  MatAutocompleteModule,
  MatInputModule,
  MatGridListModule,
  MatProgressSpinnerModule,
  MatDatepickerModule,
  MatSelectModule,
  MatNativeDateModule,
  MatStepperModule,
  MatProgressBarModule,
  MatCheckboxModule,
  MatTabsModule,
  MatRadioModule,
  MatExpansionModule,
  MatDialogModule,
  MatDialog,  
  MatDialogRef,
  MAT_DIALOG_DATA
} from '@angular/material';

import { MainNavComponent } from './components/main-nav/main-nav.component';
import { LayoutModule } from '@angular/cdk/layout';
import { NavListComponent } from './components/main-nav/nav-list/nav-list.component';

import { UploadModule } from './components/upload/upload.module';


@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    UploadDocComponent,
    MainNavComponent,
    NavListComponent,
    AppEmployComponent,
    JobInformationComponent,
    EmergencyInformationComponent,
    AhcaInformationComponent,
    W9InformationComponent,
    PdfComponent,
    DialogW9,
    UploadDocumentComponent
  ],
  imports: [
    UploadModule,
    BrowserModule,
    routing,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,
    FlexLayoutModule,
    BrowserAnimationsModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatSidenavModule,
    MatToolbarModule,
    MatCardModule,
    MatFormFieldModule,
    MatAutocompleteModule,
    MatInputModule,
    MatGridListModule,
    MatProgressSpinnerModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
    MatStepperModule,
    MatProgressBarModule,
    LayoutModule,
    MatCheckboxModule,
    MatTabsModule,
    MatRadioModule,
    MatExpansionModule,
    MatDialogModule,
    PdfViewerModule    
    ],
  providers: [
    appRoutingProviders
  ],
  bootstrap: [AppComponent],
  entryComponents: [DialogW9]
})
export class AppModule { }