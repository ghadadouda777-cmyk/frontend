import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RendezVous } from '../../interfaces/rendez-vous';

@Injectable({ providedIn: 'root' })
export class RendezVousService {
  private api = 'http://localhost:8084/api/rendez-vous';

  constructor(private http: HttpClient) {}

  // ✅ Helper : génère les headers avec le token JWT
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    });
  }

  getAll(): Observable<RendezVous[]> {
    return this.http.get<RendezVous[]>(this.api, { headers: this.getHeaders() });
  }

  getAllNutritionnistes(): Observable<any[]> {
    return this.http.get<any[]>(`${this.api}/nutritionnistes`, { headers: this.getHeaders() });
  }

  getByNutritionniste(id: string): Observable<RendezVous[]> {
    return this.http.get<RendezVous[]>(`${this.api}/nutritionniste/${id}`, { headers: this.getHeaders() });
  }

  getByCoach(id: string): Observable<RendezVous[]> {
    return this.http.get<RendezVous[]>(`${this.api}/coach/${id}`, { headers: this.getHeaders() });
  }

  getByPatient(id: string): Observable<RendezVous[]> {
    return this.http.get<RendezVous[]>(`${this.api}/user/${id}`, { headers: this.getHeaders() });
  }

  getByStatut(statut: string): Observable<RendezVous[]> {
    return this.http.get<RendezVous[]>(`${this.api}/statut/${statut}`, { headers: this.getHeaders() });
  }

  accepter(id: number): Observable<RendezVous> {
    return this.http.patch<RendezVous>(`${this.api}/${id}/accepter`, {}, { headers: this.getHeaders() });
  }

  refuser(id: number): Observable<RendezVous> {
    return this.http.patch<RendezVous>(`${this.api}/${id}/refuser`, {}, { headers: this.getHeaders() });
  }

  terminer(id: number): Observable<RendezVous> {
    return this.http.patch<RendezVous>(`${this.api}/${id}/terminer`, {}, { headers: this.getHeaders() });
  }

  create(rdv: any): Observable<RendezVous> {
    return this.http.post<RendezVous>(this.api, rdv, { headers: this.getHeaders() });
  }
}