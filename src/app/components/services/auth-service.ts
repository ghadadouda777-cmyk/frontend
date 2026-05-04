import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8084/api/auth';

  constructor(private http: HttpClient) {}

  register(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, data);
  }

  login(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, data).pipe(
      tap((response: any) => {
        if (response.token)           localStorage.setItem('token',           response.token);
        if (response.role)            localStorage.setItem('role',            response.role);
        if (response.nom)             localStorage.setItem('nom',             response.nom);
        if (response.prenom)          localStorage.setItem('prenom',          response.prenom);
        if (response.email)           localStorage.setItem('email',           response.email);

        // ✅ FIX : sauvegarde l'ID spécifique selon le rôle
        if (response.role === 'NUTRITIONIST' && response.nutritionnisteId) {
          localStorage.setItem('userId', response.nutritionnisteId);
        } else if (response.role === 'BLOOMER' && response.bloomerId) {
          localStorage.setItem('userId', response.bloomerId);
        } else if (response.id) {
          localStorage.setItem('userId', response.id); // fallback
        }
      })
    );
  }

  getUserId(): string {
    return localStorage.getItem('userId') ?? '';
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getRole(): string | null {
    return localStorage.getItem('role');
  }

  logout(): void {
    localStorage.clear();
  }
}