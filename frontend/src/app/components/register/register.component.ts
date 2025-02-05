import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-register',
  imports: [RouterLink, FormsModule, NavbarComponent],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  fullName: string = '';
  email: string = '';
  password: string = '';
  successMessage: string = ''; // Success message variable

  onRegisterSubmit(): void {
    // For now, we simulate successful registration
    console.log('Registration Attempted');
    console.log('Full Name:', this.fullName);
    console.log('Email:', this.email);
    console.log('Password:', this.password);

    // Displaying a success message
    this.successMessage = 'Registration Successful!';
    // Reset form fields after success
    this.fullName = '';
    this.email = '';
    this.password = '';
  }
}
