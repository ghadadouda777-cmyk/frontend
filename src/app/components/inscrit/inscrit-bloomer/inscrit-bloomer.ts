import { Component } from '@angular/core';
import { RouterLink, Router } from '@angular/router';  // ← ajouter Router
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth-service';


export class InscritBloomer {
  confirmPwd = '';
  agreed = false;

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

  constructor(private authService: AuthService, private router: Router) {} // ← ajouter Router

  register() {
    if (!this.agreed) {
      alert('Veuillez accepter les conditions.');
      return;
    }
    if (this.formData.pwd !== this.confirmPwd) {
      alert('Les mots de passe ne correspondent pas.');
      return;
    }
    this.authService.register(this.formData).subscribe({
      next: () => {
        alert('Bloomer inscrit avec succès !');
        this.router.navigate(['/dashboard/bloomer']); // ← REDIRECTION
      },
      error: (err) => {
        console.error(err);
        alert('Erreur lors de l\'inscription : ' + err.message);
      }
    });
  }
}