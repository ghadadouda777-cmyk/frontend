import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RendezVous } from '../../interfaces/rendez-vous';

@Injectable({ providedIn: 'root' })
export class RendezVousService {
  private api = 'http://localhost:8084/api/rendez-vous';

  constructor(private http: HttpClient) {}

  getAll(): Observable<RendezVous[]> {
    return this.http.get<RendezVous[]>(this.api);
  }
getAllNutritionnistes(): Observable<any[]> {
  return this.http.get<any[]>(`${this.api}/nutritionnistes`);
}
  // ✅ String UUID
  getByNutritionniste(id: string): Observable<RendezVous[]> {
    return this.http.get<RendezVous[]>(`${this.api}/nutritionniste/${id}`);
  }

  // ✅ String UUID
  getByCoach(id: string): Observable<RendezVous[]> {
    return this.http.get<RendezVous[]>(`${this.api}/coach/${id}`);
  }

  // ✅ String UUID
  getByPatient(id: string): Observable<RendezVous[]> {
    return this.http.get<RendezVous[]>(`${this.api}/user/${id}`);
  }

  getByStatut(statut: string): Observable<RendezVous[]> {
    return this.http.get<RendezVous[]>(`${this.api}/statut/${statut}`);
  }

  accepter(id: number): Observable<RendezVous> {
    return this.http.patch<RendezVous>(`${this.api}/${id}/accepter`, {});
  }

  refuser(id: number): Observable<RendezVous> {
    return this.http.patch<RendezVous>(`${this.api}/${id}/refuser`, {});
  }

  terminer(id: number): Observable<RendezVous> {
    return this.http.patch<RendezVous>(`${this.api}/${id}/terminer`, {});
  }
  create(rdv: any): Observable<RendezVous> {
  return this.http.post<RendezVous>(this.api, rdv);
}
}