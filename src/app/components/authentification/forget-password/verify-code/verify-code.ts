import { Component, OnInit, ViewChildren, QueryList, ElementRef } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-verify-code',
  standalone: true,
  templateUrl: './verify-code.html',
  styleUrls: ['./verify-code.css'],
  imports: [CommonModule, RouterModule],
})
export class VerifyCode implements OnInit {
  email = '';
  digits: string[] = ['', '', '', '', '', ''];
  loading = false;
  errorMessage = '';
  successMessage = '';

  @ViewChildren('digitInput') digitInputs!: QueryList<ElementRef<HTMLInputElement>>;

  private apiUrl = 'http://localhost:8084/api/auth';

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    this.email = sessionStorage.getItem('reset_email') || '';
    if (!this.email) {
      this.router.navigate(['/forget-password']);
    }
  }

  isCodeComplete(): boolean {
    return this.digits.every(d => d.length === 1);
  }

  getCode(): string {
    return this.digits.join('');
  }

  onDigitInput(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    const val = input.value.replace(/\D/g, '').slice(-1); // keep only last digit
    this.digits[index] = val;
    input.value = val;

    if (val && index < 5) {
      const inputs = this.digitInputs.toArray();
      inputs[index + 1]?.nativeElement.focus();
    }
  }

  onKeyDown(event: KeyboardEvent, index: number): void {
    if (event.key === 'Backspace') {
      if (this.digits[index]) {
        this.digits[index] = '';
      } else if (index > 0) {
        const inputs = this.digitInputs.toArray();
        this.digits[index - 1] = '';
        inputs[index - 1]?.nativeElement.focus();
      }
    }
  }

  onPaste(event: ClipboardEvent): void {
    event.preventDefault();
    const pasted = event.clipboardData?.getData('text').replace(/\D/g, '').slice(0, 6) || '';
    const inputs = this.digitInputs.toArray();
    pasted.split('').forEach((char, i) => {
      this.digits[i] = char;
      if (inputs[i]) inputs[i].nativeElement.value = char;
    });
    const lastFilled = Math.min(pasted.length, 5);
    inputs[lastFilled]?.nativeElement.focus();
  }

  verifyCode(): void {
    if (!this.isCodeComplete()) return;
    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const payload = { email: this.email, code: this.getCode() };

    this.http.post(`${this.apiUrl}/verify-code`, payload).subscribe({
      next: () => {
        this.loading = false;
        this.successMessage = 'Code verified! Redirecting...';
        sessionStorage.setItem('reset_code', this.getCode());
        setTimeout(() => this.router.navigate(['/reset-password']), 1200);
      },
      error: (err) => {
        this.loading = false;
        this.digits = ['', '', '', '', '', ''];
        const inputs = this.digitInputs.toArray();
        inputs.forEach(i => i.nativeElement.value = '');
        inputs[0]?.nativeElement.focus();
        this.errorMessage = err.error?.error || 'Invalid code. Please try again.';
      }
    });
  }

  resend(): void {
    this.errorMessage = '';
    this.successMessage = '';
    this.http.post(`${this.apiUrl}/forgot-password`, { email: this.email }).subscribe({
      next: () => {
        this.successMessage = 'A new code has been sent!';
        this.digits = ['', '', '', '', '', ''];
        const inputs = this.digitInputs.toArray();
        inputs.forEach(i => i.nativeElement.value = '');
        inputs[0]?.nativeElement.focus();
      },
      error: () => {
        this.errorMessage = 'Failed to resend. Please try again.';
      }
    });
  }
}