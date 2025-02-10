import { Component } from '@angular/core';
import { NgForm, FormsModule } from '@angular/forms'; 
import { Router, RouterLink } from '@angular/router';
import { UserService } from '../../services/user.service';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../navbar/navbar.component';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-register',
  standalone: true, 
  imports: [FormsModule, CommonModule, NavbarComponent, RouterLink, HttpClientModule ], 
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  successMessage: string = '';
  errorMessage: string = '';

  constructor(private userService: UserService, private router: Router) {}

  onRegisterSubmit(registerForm: NgForm): void {
    if (!registerForm.valid) {
      return;
    }

    const formData = {
      name: registerForm.value.fullName,
      email: registerForm.value.email,
      password: registerForm.value.password
    };

    this.userService.registerUser(formData).subscribe({
      next: (response) => {
        this.successMessage = 'Registration successful! Redirecting to login...';
        this.errorMessage = '';

        setTimeout(() => {
          this.router.navigate(['/login']); 
        }, 3000);
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Registration failed. Please try again.';
        this.successMessage = '';
      }
    });

    registerForm.reset();
  }
}
