import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Consultation } from '../../interfaces/consultation';

@Injectable({ providedIn: 'root' })
export class ConsultationService {
  private api = 'http://localhost:8085/api/consultations';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Consultation[]> {
    return this.http.get<Consultation[]>(this.api);
  }

  getByNutritionniste(id: number): Observable<Consultation[]> {
    return this.http.get<Consultation[]>(`${this.api}/nutritionniste/${id}`);
  }

  getById(id: number): Observable<Consultation> {
    return this.http.get<Consultation>(`${this.api}/${id}`);
  }

  create(consultation: Consultation): Observable<Consultation> {
    return this.http.post<Consultation>(this.api, consultation);
  }

  update(id: number, consultation: Consultation): Observable<Consultation> {
    return this.http.put<Consultation>(`${this.api}/${id}`, consultation);
  }
}