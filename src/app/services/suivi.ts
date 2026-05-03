import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SuiviQuotidien } from '../interfaces/suivi-quotidien';



@Injectable({ providedIn: 'root' })
export class SuiviService {

  private url = 'http://localhost:8084/suivi';

  constructor(private http: HttpClient) {}

  getSuiviDuJour(userId: string): Observable<SuiviQuotidien> {
    return this.http.get<SuiviQuotidien>(`${this.url}/${userId}`);
  }

  incrementEau(userId: string): Observable<SuiviQuotidien> {
    return this.http.put<SuiviQuotidien>(`${this.url}/${userId}/eau`, {});
  }

  incrementExercice(userId: string): Observable<SuiviQuotidien> {
    return this.http.put<SuiviQuotidien>(`${this.url}/${userId}/exercice`, {});
  }

  updateSommeil(userId: string, heures: number): Observable<SuiviQuotidien> {
    return this.http.put<SuiviQuotidien>(`${this.url}/${userId}/sommeil`, heures);
  }

  updateCalories(userId: string, cal: number): Observable<SuiviQuotidien> {
    return this.http.put<SuiviQuotidien>(`${this.url}/${userId}/calories`, cal);
  }

  updateProteines(userId: string, prot: number): Observable<SuiviQuotidien> {
    return this.http.put<SuiviQuotidien>(`${this.url}/${userId}/proteines`, prot);
  }
}