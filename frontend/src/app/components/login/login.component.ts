import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms'; 
import { NavbarComponent } from '../navbar/navbar.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink, FormsModule, NavbarComponent, CommonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  successMessage: string = ''; // Success message variable

  onLoginSubmit(): void {
    console.log('Login Attempted');
    console.log('Email:', this.email);
    console.log('Password:', this.password);

    this.successMessage = 'Login Successful!';

    // Reset form fields after success
    this.email = '';
    this.password = '';
  }
}
