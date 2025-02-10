import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root' // ✅ Ensure service is available globally
})
export class UserService {
  private baseUrl = 'http://localhost:3000/api/users'; // Replace with your backend URL

  constructor(private http: HttpClient) {}

  // Register a new user
  registerUser(userData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/register`, userData);
  }

  // Get all users
  getAllUsers(): Observable<any> {
    return this.http.get(`${this.baseUrl}/`);
  }

  // Get user by ID
  getUserById(userId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/${userId}`);
  }

  // Update user details
  updateUser(userId: string, userData: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/${userId}`, userData);
  }

  // Generate password reset code
  generateResetCode(email: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/request-reset-code`, { email });
  }

  // Reset user password
  resetPassword(email: string, resetCode: string, newPassword: string): Observable<any> {
    return this.http.put(`${this.baseUrl}/reset-password`, { email, resetCode, newPassword });
  }

  // Delete user
  deleteUser(userId: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${userId}`);
  }
}
