import { Routes } from '@angular/router';
import { LandingPageComponent } from './userdashboard/landing-page/landing-page.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { UserdashboardComponent} from './userdashboard/userdashboard/userdashboard.component';
import { DeveloperdashboardComponent } from './developer/developerdashboard/developerdashboard.component';
import { AdmindashboardComponent } from './admin/admindashboard/admindashboard.component';

export const routes: Routes = [
    { path: '', component: LandingPageComponent },
    { path: 'login', component: LoginComponent},
    { path: 'register', component: RegisterComponent},
    { path: 'user', component: UserdashboardComponent},
    { path: 'developer', component: DeveloperdashboardComponent},
    { path: 'admin', component: AdmindashboardComponent}
];
