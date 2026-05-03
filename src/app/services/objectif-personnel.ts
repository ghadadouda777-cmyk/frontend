import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ObjectifPersonnel } from '../interfaces/objectif-personnel';



@Injectable({ providedIn: 'root' })
export class ObjectifService {

  private url = 'http://localhost:8084/objectifs';

  constructor(private http: HttpClient) {}

  getObjectif(userId: string): Observable<ObjectifPersonnel> {
    return this.http.get<ObjectifPersonnel>(`${this.url}/${userId}`);
  }

  updateEau(userId: string, val: number): Observable<ObjectifPersonnel> {
    return this.http.patch<ObjectifPersonnel>(`${this.url}/${userId}/eau`, val);
  }

  updateSommeil(userId: string, val: number): Observable<ObjectifPersonnel> {
    return this.http.patch<ObjectifPersonnel>(`${this.url}/${userId}/sommeil`, val);
  }

  updateExercices(userId: string, val: number): Observable<ObjectifPersonnel> {
    return this.http.patch<ObjectifPersonnel>(`${this.url}/${userId}/exercices`, val);
  }

  updateCalories(userId: string, val: number): Observable<ObjectifPersonnel> {
    return this.http.patch<ObjectifPersonnel>(`${this.url}/${userId}/calories`, val);
  }

  updateProteines(userId: string, val: number): Observable<ObjectifPersonnel> {
    return this.http.patch<ObjectifPersonnel>(`${this.url}/${userId}/proteines`, val);
  }
}