import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [RouterLink, FormsModule, NavbarComponent, CommonModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  successMessage: string = '';

  onRegisterSubmit(registerForm: NgForm): void {
    if (!registerForm.valid) {
      return;
    }

    const formData = registerForm.value;
    console.log('Registration Attempted', formData);

    this.successMessage = 'Registration Successful!';
    
    // Reset form fields after success
    registerForm.reset();
  }
}
