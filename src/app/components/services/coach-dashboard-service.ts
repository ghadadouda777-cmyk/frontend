import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CoachDashboardOverviewDto {
  totalClients: number;
  activeWorkoutPlans: number;
  totalExercises: number;
  unreadMessages: number;
  subscriptionStatus: string;
  subscriptionRemainingDays: number;
}

export interface CoachWorkoutPlanSummaryDto {
  id: number;
  nom: string;
  dureeSemaines: number;
  seancesParSemaine: number;
  assignedClientsCount: number;
}

export interface CoachDashboardClientDto {
  id: string;
  name: string;
  email: string;
  assignedPlans: string[];
  progressStatus: string;
}

export interface CoachConversationDto {
  id: number;
  coachId: string;
  clientId: string;
  clientName: string;
  lastMessagePreview: string;
  lastMessageAt: string | null;
  unreadCount: number;
}

export interface CoachAnalyticsItemDto {
  label: string;
  value: string;
  trend: string;
  fillPercent: number;
}

export interface CoachExerciseDto {
  id: number;
  nom: string;
  description: string;
  series: number | null;
  repetitions: number | null;
  dureeSecondes: number | null;
  tempsReposSecondes: number | null;
  poidsKg: number | null;
  planExerciceId: number | null;
}

export interface CoachNotificationDto {
  type: string;
  text: string;
}

export interface CoachIdentity {
  coachId?: string;
  coachEmail?: string;
}

@Injectable({
  providedIn: 'root',
})
export class CoachDashboardService {
  private readonly apiUrl = 'http://localhost:8084/api/coach-dashboard';

  constructor(private readonly http: HttpClient) {}

  getOverview(identity: CoachIdentity): Observable<CoachDashboardOverviewDto> {
    return this.http.get<CoachDashboardOverviewDto>(`${this.apiUrl}/overview`, {
      params: this.toParams(identity),
      headers: this.authHeaders(),
    });
  }

  getWorkoutPlans(identity: CoachIdentity): Observable<CoachWorkoutPlanSummaryDto[]> {
    return this.http.get<CoachWorkoutPlanSummaryDto[]>(`${this.apiUrl}/workout-plans`, {
      params: this.toParams(identity),
      headers: this.authHeaders(),
    });
  }

  getClients(identity: CoachIdentity): Observable<CoachDashboardClientDto[]> {
    return this.http.get<CoachDashboardClientDto[]>(`${this.apiUrl}/clients`, {
      params: this.toParams(identity),
      headers: this.authHeaders(),
    });
  }

  getExercises(): Observable<CoachExerciseDto[]> {
    return this.http.get<CoachExerciseDto[]>('http://localhost:8084/api/exercices', {
      headers: this.authHeaders(),
    });
  }

  getConversations(identity: CoachIdentity): Observable<CoachConversationDto[]> {
    return this.http.get<CoachConversationDto[]>(`${this.apiUrl}/conversations`, {
      params: this.toParams(identity),
      headers: this.authHeaders(),
    });
  }

  getAnalytics(identity: CoachIdentity): Observable<CoachAnalyticsItemDto[]> {
    return this.http.get<CoachAnalyticsItemDto[]>(`${this.apiUrl}/analytics`, {
      params: this.toParams(identity),
      headers: this.authHeaders(),
    });
  }

  getNotifications(identity: CoachIdentity): Observable<CoachNotificationDto[]> {
    return this.http.get<CoachNotificationDto[]>(`${this.apiUrl}/notifications`, {
      params: this.toParams(identity),
      headers: this.authHeaders(),
    });
  }

  private toParams(identity: CoachIdentity): Record<string, string> {
    const params: Record<string, string> = {};
    if (identity.coachId) {
      params['coachId'] = identity.coachId;
    }
    if (identity.coachEmail) {
      params['coachEmail'] = identity.coachEmail;
    }
    return params;
  }

  private authHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') ?? sessionStorage.getItem('token');
    if (!token) {
      return new HttpHeaders();
    }
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
  }
}
