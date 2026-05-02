import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RendezVous } from '../../interfaces/rendez-vous';

@Injectable({ providedIn: 'root' })
export class RendezVousService {
  getByPatient(patientId: number) {
    throw new Error('Method not implemented.');
  } // ✅ renamed
  private api = 'http://localhost:8085/api/rendez-vous';

  constructor(private http: HttpClient) {}

  getAll(): Observable<RendezVous[]> {
    return this.http.get<RendezVous[]>(this.api);
  }

  getByNutritionniste(id: number): Observable<RendezVous[]> {
    return this.http.get<RendezVous[]>(`${this.api}/nutritionniste/${id}`);
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
}