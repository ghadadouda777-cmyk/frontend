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
        if (response.token)  localStorage.setItem('token',  response.token);
        if (response.id)     localStorage.setItem('userId', response.id); // ✅ pas de toString()
        if (response.role)   localStorage.setItem('role',   response.role);
        if (response.nom)    localStorage.setItem('nom',    response.nom);
        if (response.prenom) localStorage.setItem('prenom', response.prenom);
        if (response.email)  localStorage.setItem('email',  response.email);
      })
    );
  }

  // ✅ String UUID
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