import { Component } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

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
    typeAbonnement: 'AN_1', // ✅ plan par défaut
    role: 'BLOOMER',
  };

  constructor(private router: Router) {} // ✅ supprimé AuthService

  selectPlan(plan: string) { // ✅ ajouté
    this.formData.typeAbonnement = plan;
  }

  register() {
    if (!this.agreed) {
      alert('Veuillez accepter les conditions.');
      return;
    }
    if (this.formData.pwd !== this.confirmPwd) {
      alert('Les mots de passe ne correspondent pas.');
      return;
    }

    // ✅ Sauvegarde et redirige vers abonnement
    sessionStorage.setItem('register_data', JSON.stringify(this.formData));
    this.router.navigate(['/abonnement']);
  }
}