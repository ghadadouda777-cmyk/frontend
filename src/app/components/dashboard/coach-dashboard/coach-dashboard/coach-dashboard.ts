import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { forkJoin } from 'rxjs';
import {
  CoachAnalyticsItemDto,
  CoachConversationDto,
  CoachDashboardClientDto,
  CoachDashboardOverviewDto,
  CoachDashboardService,
  CoachExerciseDto,
  CoachIdentity,
  CoachNotificationDto,
  CoachWorkoutPlanSummaryDto,
} from '../../../services/coach-dashboard-service';

type SubscriptionState = 'Active' | 'Expired';

interface SidebarItem {
  label: string;
  icon: string;
  active?: boolean;
  badgeCount?: number;
}

interface OverviewCard {
  label: string;
  value: string;
  helper: string;
  accent: 'green' | 'blue' | 'purple' | 'orange' | 'neutral';
}

interface WorkoutPlanItem {
  id: number;
  nom: string;
  dureeSemaines: number;
  seancesParSemaine: number;
  assignedClientsCount: number;
}

interface ExerciseItem {
  id: number;
  nom: string;
  categorie: string;
  description: string;
}

interface ClientItem {
  id: number;
  name: string;
  email: string;
  assignedPlans: string[];
  progressStatus: string;
}

interface ConversationItem {
  id: number;
  clientName: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
}

interface AnalyticsItem {
  label: string;
  value: string;
  trend: string;
  fillPercent: number;
}

interface NotificationItem {
  id: number;
  text: string;
  type: string;
}

@Component({
  selector: 'app-coach-dashboard',
  imports: [],
  templateUrl: './coach-dashboard.html',
  styleUrl: './coach-dashboard.css',
})
export class CoachDashboard implements OnInit {
  readonly coachName = 'Coach Samira';
  readonly coachRole = 'Performance Coach';
  readonly searchPlaceholder = 'Search clients, plans, exercises...';

  subscription = {
    currentPlan: '3 months Pro',
    status: 'Active' as SubscriptionState,
    remainingDays: 42,
    expirationDate: '2026-06-12',
  };

  readonly sidebarItems: SidebarItem[] = [
    { label: 'Dashboard', icon: '🏠', active: true },
    { label: 'Clients', icon: '🧑‍🤝‍🧑' },
    { label: 'Workout Plans', icon: '📋' },
    { label: 'Exercises', icon: '🏋️' },
    { label: 'Conversations', icon: '💬', badgeCount: 8 },
    { label: 'Subscription', icon: '💳' },
    { label: 'Profile', icon: '👤' },
  ];

  workoutPlans: WorkoutPlanItem[] = [];

  exercises: ExerciseItem[] = [];

  clients: ClientItem[] = [];

  conversations: ConversationItem[] = [];

  analytics: AnalyticsItem[] = [];

  notifications: NotificationItem[] = [];
  isLoading = false;
  apiError = '';

  constructor(
    private readonly coachDashboardService: CoachDashboardService,
    private readonly route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    const coachId =
      this.route.snapshot.queryParamMap.get('coachId') ??
      localStorage.getItem('userId') ??
      sessionStorage.getItem('userId') ??
      undefined;
    const coachEmail =
      this.route.snapshot.queryParamMap.get('coachEmail') ??
      localStorage.getItem('email') ??
      sessionStorage.getItem('email') ??
      this.extractEmailFromToken(localStorage.getItem('token')) ??
      this.extractEmailFromToken(sessionStorage.getItem('token')) ??
      undefined;
    const identity: CoachIdentity = { coachId, coachEmail };

    if (!identity.coachId && !identity.coachEmail) {
      this.apiError = 'Identite coach introuvable. Connecte-toi d abord, ou passe coachEmail dans l URL.';
      return;
    }

    this.loadDashboardData(identity);
  }

  get overviewCards(): OverviewCard[] {
    return [
      { label: 'Total Clients', value: String(this.clients.length), helper: 'Across active programs', accent: 'green' },
      { label: 'Active Workout Plans', value: String(this.workoutPlans.length), helper: 'Recently updated plans', accent: 'blue' },
      { label: 'Total Exercises', value: String(this.exercises.length), helper: 'Reusable exercise library', accent: 'purple' },
      { label: 'Unread Messages', value: String(this.totalUnreadMessages), helper: 'Needs your response', accent: 'orange' },
      { label: 'Subscription Status', value: this.subscription.status, helper: `${this.subscription.remainingDays} days remaining`, accent: 'neutral' },
    ];
  }

  get totalUnreadMessages(): number {
    return this.conversations.reduce((sum, conversation) => sum + conversation.unreadCount, 0);
  }

  private loadDashboardData(identity: CoachIdentity): void {
    this.isLoading = true;
    this.apiError = '';

    forkJoin({
      overview: this.coachDashboardService.getOverview(identity),
      plans: this.coachDashboardService.getWorkoutPlans(identity),
      exercises: this.coachDashboardService.getExercises(),
      clients: this.coachDashboardService.getClients(identity),
      conversations: this.coachDashboardService.getConversations(identity),
      analytics: this.coachDashboardService.getAnalytics(identity),
      notifications: this.coachDashboardService.getNotifications(identity),
    }).subscribe({
      next: (data) => {
        this.applyOverview(data.overview);
        this.workoutPlans = data.plans.map((plan) => this.mapPlan(plan));
        this.exercises = data.exercises.map((exercise) => this.mapExercise(exercise));
        this.clients = data.clients.map((client, index) => this.mapClient(client, index));
        this.conversations = data.conversations.map((chat) => this.mapConversation(chat));
        this.analytics = data.analytics.map((item) => this.mapAnalytics(item));
        this.notifications = data.notifications.map((notif, index) => this.mapNotification(notif, index + 1));
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        this.apiError = error?.error?.error ?? error?.message ?? 'Erreur lors du chargement du dashboard.';
      },
    });
  }

  private applyOverview(overview: CoachDashboardOverviewDto): void {
    this.subscription.status = overview.subscriptionStatus === 'Active' ? 'Active' : 'Expired';
    this.subscription.remainingDays = overview.subscriptionRemainingDays;
  }

  private mapPlan(plan: CoachWorkoutPlanSummaryDto): WorkoutPlanItem {
    return {
      id: plan.id,
      nom: plan.nom,
      dureeSemaines: plan.dureeSemaines,
      seancesParSemaine: plan.seancesParSemaine,
      assignedClientsCount: plan.assignedClientsCount,
    };
  }

  private mapExercise(exercise: CoachExerciseDto): ExerciseItem {
    return {
      id: exercise.id,
      nom: exercise.nom,
      categorie: this.detectExerciseCategory(exercise),
      description: exercise.description || 'No description',
    };
  }

  private mapClient(client: CoachDashboardClientDto, index: number): ClientItem {
    return {
      id: index + 1,
      name: client.name,
      email: client.email,
      assignedPlans: client.assignedPlans ?? [],
      progressStatus: client.progressStatus,
    };
  }

  private mapConversation(chat: CoachConversationDto): ConversationItem {
    return {
      id: chat.id,
      clientName: chat.clientName,
      lastMessage: chat.lastMessagePreview || 'No messages yet',
      timestamp: this.formatDate(chat.lastMessageAt),
      unreadCount: chat.unreadCount,
    };
  }

  private mapAnalytics(item: CoachAnalyticsItemDto): AnalyticsItem {
    return {
      label: item.label,
      value: item.value,
      trend: item.trend,
      fillPercent: item.fillPercent,
    };
  }

  private mapNotification(notification: CoachNotificationDto, id: number): NotificationItem {
    return { id, text: notification.text, type: notification.type };
  }

  private formatDate(dateValue: string | null): string {
    if (!dateValue) {
      return 'No activity';
    }
    const d = new Date(dateValue);
    if (Number.isNaN(d.getTime())) {
      return dateValue;
    }
    return d.toLocaleString([], {
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  private detectExerciseCategory(exercise: CoachExerciseDto): string {
    if ((exercise.dureeSecondes ?? 0) >= 120) {
      return 'Cardio';
    }
    if ((exercise.series ?? 0) >= 3) {
      return 'Strength';
    }
    return 'General';
  }

  private extractEmailFromToken(token: string | null): string | undefined {
    if (!token) {
      return undefined;
    }

    const parts = token.split('.');
    if (parts.length < 2) {
      return undefined;
    }

    try {
      const payloadJson = atob(parts[1]);
      const payload = JSON.parse(payloadJson) as { sub?: string; email?: string };
      return payload.sub ?? payload.email;
    } catch {
      return undefined;
    }
  }
}
