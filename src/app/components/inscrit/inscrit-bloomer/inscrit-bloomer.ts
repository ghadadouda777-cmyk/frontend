import { Component } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-inscrit-bloomer',
  standalone: true,
  imports: [RouterLink, FormsModule, CommonModule],
  templateUrl: './inscrit-bloomer.html',
  styleUrl: './inscrit-bloomer.css'
})
export class InscritBloomer {
  confirmPwd = '';
  agreed = false;
  loading = false;
  errorMessage = '';

  formData = {
    nom: '',
    prenom: '',
    email: '',
    pwd: '',
    tel: '',
    age: null as number | null,
    height: null as number | null,
    weight: null as number | null,
    goal: '',
    lifestyleLevel: '',
    role: 'BLOOMER',
  };

  private apiUrl = 'http://localhost:8084/api';

  constructor(private router: Router, private http: HttpClient) {}

  register() {
    if (!this.agreed) {
      alert('Veuillez accepter les conditions.');
      return;
    }
    if (this.formData.pwd !== this.confirmPwd) {
      alert('Les mots de passe ne correspondent pas.');
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.http.post<any>(`${this.apiUrl}/auth/register`, this.formData).subscribe({
      next: (res) => {
        this.loading = false;
        localStorage.setItem('token', res.token);
        localStorage.setItem('role', res.role);
        this.router.navigate(['/dashboard/bloomerr']);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'Erreur lors de l\'inscription.';
      }
    });
  }
}