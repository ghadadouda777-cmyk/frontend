import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-request-mail',
  templateUrl: './request-mail.html',
  styleUrls: ['./request-mail.css'],
    imports: [CommonModule, FormsModule],

})
export class RequestMail {
  email = '';
  loading = false;
  errorMessage = '';
  successMessage = '';

  private apiUrl = 'http://localhost:8084/api/auth';

  constructor(private http: HttpClient, private router: Router) {}

  sendCode(): void {
    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.http.post(`${this.apiUrl}/forgot-password`, { email: this.email }).subscribe({
      next: () => {
        this.loading = false;
        this.successMessage = 'Code sent! Check your email.';
        // Store email in session for next steps
        sessionStorage.setItem('reset_email', this.email);
        setTimeout(() => this.router.navigate(['/verify-code']), 1500);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.error || 'Something went wrong. Please try again.';
      }
    });
  }
}