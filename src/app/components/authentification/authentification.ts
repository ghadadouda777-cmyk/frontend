import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth-service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-authentification',
  standalone: true,
  imports: [RouterLink, FormsModule, CommonModule],
  templateUrl: './authentification.html',
  styleUrl: './authentification.css',
})
export class Authentification implements OnInit {
  role   = '';
  email  = '';
  pwd    = '';
  loading = false;
  errorMsg = '';

  private route       = inject(ActivatedRoute);
  private router      = inject(Router);
  private authService = inject(AuthService);

  ngOnInit() {
    this.role = this.route.snapshot.params['role'];
    console.log('role =', this.role);
    if (!this.role) {
      this.router.navigate(['/Acceuil']);
    }
  }

  login() {
    if (!this.email || !this.pwd) {
      this.errorMsg = 'Veuillez remplir tous les champs.';
      return;
    }

    this.loading  = true;
    this.errorMsg = '';

    this.authService.login({ email: this.email, pwd: this.pwd, role: this.role }).subscribe({
      next: () => {
        this.loading = false;

        // Vérifier que l'userId a bien été sauvegardé
        const userId = this.authService.getUserId();
        console.log('✅ Login OK — userId =', userId);

        switch (this.role) {
          case 'nutritionist': this.router.navigate(['/dashboard/nutritionist']); break;
          case 'coach':        this.router.navigate(['/dashboard/coach']);        break;
          case 'bloomer':      this.router.navigate(['/dashboard/bloomer']);      break;
          default:             this.router.navigate(['/Acceuil']);
        }
      },
      error: (err) => {
        this.loading  = false;
        this.errorMsg = 'Email ou mot de passe incorrect.';
        console.error(err);
      }
    });
  }
}