import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms'; 
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-login',
  imports: [ RouterLink,FormsModule, NavbarComponent],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  successMessage: string = ''; // Success message variable

  onLoginSubmit(): void {
    // For now, we simulate successful login
    console.log('Login Attempted');
    console.log('Email:', this.email);
    console.log('Password:', this.password);

    // Displaying a success message
    this.successMessage = 'Login Successful!';
    // Reset form fields after success
    this.email = '';
    this.password = '';
  }
}
