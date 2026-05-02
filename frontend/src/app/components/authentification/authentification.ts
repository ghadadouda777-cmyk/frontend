import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { AuthService } from '../services/auth-service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-authentification',
  imports: [RouterLink, FormsModule],
  templateUrl: './authentification.html',
  styleUrl: './authentification.css',
})
export class Authentification {
  role = "";
  email = "";
  pwd = "";

  private route: ActivatedRoute = inject(ActivatedRoute);
  private router: Router = inject(Router);
  private authService: AuthService = inject(AuthService);
credentials: any;

  ngOnInit() {
    this.role = this.route.snapshot.params['role'];
    console.log('role =', this.role);

    if (!this.role) {
      this.router.navigate(['/Acceuil']);
    }
  }

  login() {
    this.authService.login({ email: this.email, pwd: this.pwd, role: this.role }).subscribe({
      next: (response: any) => {
        // Redirection selon le rôle
        switch (this.role) {
          case 'nutritionist':
            this.router.navigate(['/dashboard/nutritionist']);
            break;
          case 'coach':
            this.router.navigate(['/dashboard/coach']);
            break;
          case 'bloomer':
            this.router.navigate(['/dashboard/bloomer']);
            break;
          default:
            this.router.navigate(['/Acceuil']);
        }
      },
      error: (err) => {
        alert('Email ou mot de passe incorrect');
        console.error(err);
      }
    });
  }
}