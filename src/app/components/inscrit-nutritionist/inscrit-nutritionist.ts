import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-inscrit-nutritionist',
  standalone: true,
  imports: [RouterLink, FormsModule, CommonModule],
  templateUrl: './inscrit-nutritionist.html',
  styleUrl: './inscrit-nutritionist.css',
})
export class InscritNutritionist {
  confirmPwd = '';
  agreed = false;

  formData = {
    nom: '',
    prenom: '',
    email: '',
    
    pwd: '',
    tel: '',
    specialite: '',
    localisation: '',
    typeAbonnement: '',
    role: 'NUTRITIONIST',
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

    // ✅ Sauvegarde les données et redirige vers la page abonnement
    sessionStorage.setItem('register_data', JSON.stringify(this.formData));
    this.router.navigate(['/abonnement']);
  }

  selectPlan(plan: string) {
    this.formData.typeAbonnement = plan;
  }
}