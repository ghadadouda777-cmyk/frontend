import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-abonnement',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './abonnement.html',
  styleUrl: './abonnement.css',
})
export class Abonnement implements OnInit {

  selectedPlan = '';
  loading = false;
  errorMessage = '';
  successMessage = '';
  detectedRole = 'bloomer';

  paymentData = {
    nomCarte: '',
    numeroCarte: '',
    dateExpiration: '',
    cvv: '',
    typeAbonnement: ''
  };

  plans = [
    { id: 'MOIS_1', label: '1 MONTH',   total: 300,  perMonth: 300 },
    { id: 'MOIS_3', label: '3 MONTHS',  total: 750,  perMonth: 250 },
    { id: 'MOIS_6', label: '6 MONTHS',  total: 1320, perMonth: 220 },
    { id: 'AN_1',   label: '1 YEAR ⭐', total: 2160, perMonth: 180 },
  ];

  private registerData: any = null;
  private apiUrl = 'http://localhost:8084/api';

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    // ✅ Guard SSR
    if (!isPlatformBrowser(this.platformId)) return;

    const saved = sessionStorage.getItem('register_data');
    if (!saved) {
      this.router.navigate(['/inscrire']);
      return;
    }
    this.registerData = JSON.parse(saved);
    if (this.registerData?.role) {
      this.detectedRole = this.registerData.role.toLowerCase();
    }
  }

  private redirectByRole(role: string): void {
    const r = (role || '').toLowerCase();
    if (r === 'coach') {
      this.router.navigate(['/dashboard/coach']);
    } else if (r === 'nutritionist') {
      this.router.navigate(['/dashboard/nutritionist']);
    } else {
      this.router.navigate(['/dashboard/bloomer']);
    }
  }

  getLoginRoute(): string[] {
    if (this.detectedRole === 'coach') return ['/authentification', 'coach'];
    if (this.detectedRole === 'nutritionist') return ['/authentification', 'nutritionist'];
    return ['/authentification', 'bloomer'];
  }

  selectPlan(planId: string): void {
    this.selectedPlan = planId;
    this.paymentData.typeAbonnement = planId;
  }

  formatCardNumber(event: any): void {
    let val = event.target.value.replace(/\D/g, '').slice(0, 16);
    val = val.replace(/(.{4})/g, '$1 ').trim();
    this.paymentData.numeroCarte = val;
    event.target.value = val;
  }

  formatExpiry(event: any): void {
    let val = event.target.value.replace(/\D/g, '').slice(0, 4);
    if (val.length >= 3) val = val.slice(0, 2) + '/' + val.slice(2);
    this.paymentData.dateExpiration = val;
    event.target.value = val;
  }

  formatCvv(event: any): void {
    let val = event.target.value.replace(/\D/g, '').slice(0, 3);
    this.paymentData.cvv = val;
    event.target.value = val;
  }

  isFormValid(): boolean {
    return (
      !!this.selectedPlan &&
      !!this.paymentData.nomCarte.trim() &&
      this.paymentData.numeroCarte.replace(/\s/g, '').length === 16 &&
      this.paymentData.dateExpiration.length === 5 &&
      this.paymentData.cvv.length === 3
    );
  }

  subscribe(): void {
    if (!this.isFormValid()) {
      this.errorMessage = 'Veuillez remplir tous les champs correctement.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    // ✅ Un seul appel HTTP — register + paiement ensemble
    const payload = {
      register: { ...this.registerData },
      payment: {
        nomCarte:       this.paymentData.nomCarte.trim(),
        numeroCarte:    this.paymentData.numeroCarte.replace(/\s/g, ''),
        dateExpiration: this.paymentData.dateExpiration,
        cvv:            this.paymentData.cvv,
        typeAbonnement: this.selectedPlan
      }
    };

    this.http.post<any>(`${this.apiUrl}/auth/register-with-payment`, payload).subscribe({
      next: (res) => {
        this.loading = false;
        this.successMessage = 'Abonnement activé ! Redirection...';
        localStorage.setItem('token', res.token);
        localStorage.setItem('role', res.role);
        if (isPlatformBrowser(this.platformId)) {
          sessionStorage.removeItem('register_data');
        }
        setTimeout(() => this.redirectByRole(res.role), 1500);
      },
      error: (err) => {
        this.loading = false;
        if (err.status === 403) {
          this.errorMessage = 'Accès refusé. Email déjà utilisé ?';
        } else {
          this.errorMessage = err.error?.error || err.error?.message || 'Erreur lors de l\'inscription.';
        }
        console.error('Error:', err);
      }
    });
  }
}