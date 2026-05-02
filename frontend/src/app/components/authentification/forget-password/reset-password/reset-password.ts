import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  templateUrl: './reset-password.html',
  styleUrls: ['./reset-password.css'],
  imports: [CommonModule, FormsModule, RouterModule],
})
export class ResetPassword implements OnInit {
  newPassword = '';
  confirmPassword = '';
  showPassword = false;
  showConfirm = false;
  loading = false;
  errorMessage = '';
  successMessage = '';

  private email = '';
  private code = '';
  private apiUrl = 'http://localhost:8084/api/auth';

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    this.email = sessionStorage.getItem('reset_email') || '';
    this.code  = sessionStorage.getItem('reset_code')  || '';
    if (!this.email || !this.code) {
      this.router.navigate(['/forget-password']);
    }
  }

  resetPassword(): void {
    if (this.newPassword !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const payload = {
      email: this.email,
      code: this.code,
      newPassword: this.newPassword
    };

    this.http.post(`${this.apiUrl}/reset-password`, payload).subscribe({
      next: () => {
        this.loading = false;
        this.successMessage = 'Password reset successfully!';
        sessionStorage.removeItem('reset_email');
        sessionStorage.removeItem('reset_code');
        // ✅ Redirect to login after 2 seconds
        setTimeout(() => this.router.navigate(['/authentification', 'bloomer']), 2000);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.error || 'Something went wrong. Please try again.';
      }
    });
  }
}