import { Component } from '@angular/core';
import { NgForm, FormsModule } from '@angular/forms'; 
import { Router, RouterLink } from '@angular/router';
import { UserService } from '../../services/user.service';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-register',
  standalone: true, 
  imports: [FormsModule, CommonModule, NavbarComponent, RouterLink],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  successMessage: string = '';
  errorMessage: string = '';
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;

  constructor(private userService: UserService, private router: Router) {}

  togglePasswordVisibility(field: string): void {
    if (field === 'password') {
      this.showPassword = !this.showPassword;
    } else if (field === 'confirmPassword') {
      this.showConfirmPassword = !this.showConfirmPassword;
    }
  }

  onRegisterSubmit(registerForm: NgForm): void {
    if (!registerForm.valid) {
      this.errorMessage = "Please fill all required fields correctly.";
      return;
    }

    if (registerForm.value.password !== registerForm.value.confirmPassword) {
      this.errorMessage = "Passwords do not match.";
      return;
    }

    const formData = {
      name: registerForm.value.fullName,
      email: registerForm.value.email,
      password: registerForm.value.password
    };

    this.userService.registerUser(formData).subscribe({
      next: () => {
        this.successMessage = 'Registration successful! Redirecting to login...';
        this.errorMessage = '';

        setTimeout(() => {
          this.router.navigate(['/login']); 
        }, 3000);
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Registration failed. Please try again.';
        this.successMessage = '';
        this.clearMessagesAfterDelay();
      }
    });

    registerForm.reset();
  }
  clearMessagesAfterDelay(): void {
    setTimeout(() => {
      this.errorMessage = '';
      this.successMessage = '';
    }, 3000);
}
}
