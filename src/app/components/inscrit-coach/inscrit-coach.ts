import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-inscrit-coach',
  standalone: true,
  imports: [RouterLink, FormsModule, CommonModule],
  templateUrl: './inscrit-coach.html',
  styleUrl: './inscrit-coach.css',
})
export class InscritCoach {
  confirmPwd = '';
  agreed = false;

  formData = {
    nom: '',
    prenom: '',
    email: '',
    pwd: '',
    tel: '',
    coachSpecialite: '',
    certifications: '',
    typeAbonnement: 'AN_1', // plan par défaut
    role: 'COACH',
  };

  constructor(private router: Router) {}

  register() {
    if (!this.agreed) {
      alert('Veuillez accepter les conditions.');
      return;
    }
    if (this.formData.pwd !== this.confirmPwd) {
      alert('Les mots de passe ne correspondent pas.');
      return;
    }

    sessionStorage.setItem('register_data', JSON.stringify(this.formData));
    this.router.navigate(['/abonnement']);
  }

  selectPlan(plan: string) {
    this.formData.typeAbonnement = plan;
  }
}