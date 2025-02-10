import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http'; 
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule, HttpClientModule, NavbarComponent, RouterLink], 
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  successMessage: string = '';
  errorMessage: string = '';
  showPassword: boolean = false; 

  constructor(private http: HttpClient, private router: Router) {}

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  onLoginSubmit(): void {
    if (!this.email || !this.password) {
      this.errorMessage = 'Email and password are required.';
      return;
    }

    console.log('Logging in with:', { email: this.email, password: this.password });

    const loginData = { email: this.email, password: this.password };

    this.http
      .post<{ message: string; token: string; user: any }>(
        'http://localhost:3000/api/auth/login',
        loginData
      )
      .subscribe(
        (response) => {
          console.log('Login successful:', response);

          localStorage.setItem('token', response.token);
          localStorage.setItem('role', response.user.role);

          this.successMessage = 'Logged in successfully!';
          this.errorMessage = ''; 

          setTimeout(() => {
            this.redirectUser(response.user.role);
          }, 2000); // Redirect after 2 seconds
        },
        (error) => {
          console.log('Login error:', error);
          
          if (error.status === 404) {
            this.errorMessage = ' Please register first!!!';
          } else if (error.status === 401) {
            this.errorMessage = 'Wrong password. Please try again.';
          } else {
            this.errorMessage = 'Login failed. Please check your credentials and try again.';
          }

          this.successMessage = ''; 
        }
      );
  }

  redirectUser(role: string) {
    if (role === 'user') {
      this.router.navigate(['/user']);
    } else if (role === 'developer') {
      this.router.navigate(['/developer']);
    } else if (role === 'admin') {
      this.router.navigate(['/admin']);
    } else {
      this.router.navigate(['/']);
    }
  }
}
