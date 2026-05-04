import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Subscription } from 'rxjs';

import { RendezVousService }     from '../../../services/rendez-vous';
import { ConsultationService }   from '../../../services/consultation';
import { ConversationComponent } from '../../../conversation/conversation';

import { RendezVous }   from '../../../../interfaces/rendez-vous';
import { Consultation } from '../../../../interfaces/consultation';

// ── Local types for PlanAlimentaire (interface is empty in the project) ───────
interface RepasJour {
  id: number;
  type: string;
  calories: number;
  aliments: string[];
}

interface PlanAlimentaireDetail {
  id: number;
  titre: string;
  objectif: string;
  dateCreation: string;
  patientId: number;
  nutritionnisteId: number;
  repas: RepasJour[];
}

// ── Sections de la sidebar ────────────────────────────────────────────────────
export type Section =
  | 'dashboard'
  | 'rdv-nutritionniste'
  | 'rdv-coach'
  | 'plan'
  | 'messages-nutritionniste'
  | 'messages-coach'
  | 'profile';

@Component({
  selector: 'app-patient-dashboard',
  standalone: true,
  imports: [CommonModule, DatePipe, DecimalPipe, FormsModule, ConversationComponent],
  templateUrl: './patient-dashboard.html',
  styleUrls: ['./patient-dashboard.css']
})
export class PatientDashboard implements OnInit, OnDestroy {

  // ── Identité (à remplacer par AuthService) ────────────────────────────────
  userId           = 1;
  nutritionnisteId = 1;
  coachId          = 2;

  // ── Section active ────────────────────────────────────────────────────────
  activeSection: Section = 'dashboard';

  // ── RDV Nutritionniste ────────────────────────────────────────────────────
  rdvNutriEnAttente: RendezVous[] = [];
  rdvNutriConfirmes: RendezVous[] = [];
  rdvNutriRefuses:   RendezVous[] = [];
  activeTabNutri: 'attente' | 'confirme' | 'refuse' = 'attente';

  // ── RDV Coach ─────────────────────────────────────────────────────────────
  rdvCoachEnAttente: RendezVous[] = [];
  rdvCoachConfirmes: RendezVous[] = [];
  rdvCoachRefuses:   RendezVous[] = [];
  activeTabCoach: 'attente' | 'confirme' | 'refuse' = 'attente';

  // ── Slots déjà pris (calendrier) ──────────────────────────────────────────
  takenSlotsNutri: { date: string; heure: string }[] = [];
  takenSlotsCoach: { date: string; heure: string }[] = [];

  // ── Consultations ─────────────────────────────────────────────────────────
  consultations:        Consultation[]      = [];
  derniereConsultation: Consultation | null = null;
  selectedConsultation: Consultation | null = null;
  showConsultationModal = false;

  // ── Plan alimentaire ──────────────────────────────────────────────────────
  planAlimentaire: PlanAlimentaireDetail | null = null;
  planLoading = false;

  private readonly planApi = 'http://localhost:8084/api/plans-alimentaires';
  private readonly rdvApi  = 'http://localhost:8084/api/rendez-vous';

  // ── Calendrier partagé ────────────────────────────────────────────────────
  showCalendar       = false;
  calendarTarget:    'nutritionniste' | 'coach' = 'nutritionniste';
  calendarYear       = 0;
  calendarMonth      = 0;
  calendarDays:      (number | null)[] = [];
  selectedDate:      Date | null = null;
  selectedSlot:      string | null = null;
  rdvMotif           = '';
  confirmationDone   = false;
  confirmationError  = false;

  readonly timeSlots = [
    '08:00','08:30','09:00','09:30',
    '10:00','10:30','11:00','11:30',
    '14:00','14:30','15:00','15:30',
    '16:00','16:30','17:00'
  ];

  readonly MONTH_NAMES = [
    'Janvier','Février','Mars','Avril','Mai','Juin',
    'Juillet','Août','Septembre','Octobre','Novembre','Décembre'
  ];
  readonly DAY_NAMES = ['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'];

  // ── Profil (statique pour l'instant) ─────────────────────────────────────
  profile = {
    prenom: 'Ahmed',
    nom:    'Aloui',
    email:  'ahmed.aloui@email.com',
    phone:  '+216 12 345 678',
    age:    28,
    ville:  'Tunis'
  };

  private pollSub: Subscription | null = null;

  constructor(
    private rdvService:     RendezVousService,
    private consultService: ConsultationService,
    private http:           HttpClient
  ) {}

  ngOnInit(): void {
    const now = new Date();
    this.calendarYear  = now.getFullYear();
    this.calendarMonth = now.getMonth();
    this.buildCalendar();
    this.loadAll();
  }

  ngOnDestroy(): void {
    this.pollSub?.unsubscribe();
  }

  // ── Chargement global ─────────────────────────────────────────────────────
  loadAll(): void {
    this.loadRdvNutri();
    this.loadRdvCoach();
    this.loadConsultations();
    this.loadPlan();
  }

  // ── RDV Nutritionniste ────────────────────────────────────────────────────
  loadRdvNutri(): void {
    this.rdvService.getAll().subscribe((data: RendezVous[]) => {
      const mine = data.filter(r => r.userId === this.userId && r.nutritionnisteId === this.nutritionnisteId);
      this.rdvNutriEnAttente = mine.filter(r => r.statut === 'EN_ATTENTE');
      this.rdvNutriConfirmes = mine.filter(r => r.statut === 'CONFIRME');
      this.rdvNutriRefuses   = mine.filter(r => r.statut === 'REFUSE');
      this.takenSlotsNutri   = mine.map(r => ({
        date:  r.dateHeure.substring(0, 10),
        heure: r.dateHeure.substring(11, 16)
      }));
    });
  }

  // ── RDV Coach ─────────────────────────────────────────────────────────────
  loadRdvCoach(): void {
    this.rdvService.getAll().subscribe((data: RendezVous[]) => {
      const mine = data.filter(r => r.userId === this.userId && r.nutritionnisteId === this.coachId);
      this.rdvCoachEnAttente = mine.filter(r => r.statut === 'EN_ATTENTE');
      this.rdvCoachConfirmes = mine.filter(r => r.statut === 'CONFIRME');
      this.rdvCoachRefuses   = mine.filter(r => r.statut === 'REFUSE');
      this.takenSlotsCoach   = mine.map(r => ({
        date:  r.dateHeure.substring(0, 10),
        heure: r.dateHeure.substring(11, 16)
      }));
    });
  }

  // ── Consultations ─────────────────────────────────────────────────────────
  loadConsultations(): void {
    this.consultService.getAll().subscribe((data: Consultation[]) => {
      this.consultations = data
        .filter(c => c.userId === this.userId)
        .sort((a, b) => new Date(b.dateConsultation).getTime() - new Date(a.dateConsultation).getTime());
      this.derniereConsultation = this.consultations[0] ?? null;
    });
  }

  openConsultation(id: number): void {
    this.consultService.getById(id).subscribe((data: Consultation) => {
      this.selectedConsultation = data;
      this.showConsultationModal = true;
    });
  }

  closeConsultationModal(): void {
    this.showConsultationModal = false;
    this.selectedConsultation  = null;
  }

  // ── Plan alimentaire ──────────────────────────────────────────────────────
  loadPlan(): void {
    this.planLoading = true;
    this.http.get<PlanAlimentaireDetail[]>(`${this.planApi}/patient/${this.userId}`).subscribe({
      next: (plans) => {
        this.planAlimentaire = plans.length > 0
          ? plans.sort((a, b) => new Date(b.dateCreation).getTime() - new Date(a.dateCreation).getTime())[0]
          : null;
        this.planLoading = false;
      },
      error: () => { this.planLoading = false; }
    });
  }

  getTotalCalories(): number {
    return this.planAlimentaire?.repas.reduce((s, r) => s + r.calories, 0) ?? 0;
  }

  getRepasIcon(type: string): string {
    const m: Record<string, string> = {
      PETIT_DEJEUNER: '🌅', DEJEUNER: '☀️', COLLATION: '🍎', DINER: '🌙'
    };
    return m[type] ?? '🍽️';
  }

  getRepasLabel(type: string): string {
    const m: Record<string, string> = {
      PETIT_DEJEUNER: 'Petit-déjeuner', DEJEUNER: 'Déjeuner',
      COLLATION: 'Collation', DINER: 'Dîner'
    };
    return m[type] ?? type;
  }

  // ── Navigation sidebar ────────────────────────────────────────────────────
  goTo(section: Section): void {
    this.activeSection = section;
  }

  // ── Calendrier ────────────────────────────────────────────────────────────
  openCalendarFor(target: 'nutritionniste' | 'coach'): void {
    this.calendarTarget   = target;
    this.showCalendar     = true;
    this.selectedDate     = null;
    this.selectedSlot     = null;
    this.confirmationDone = false;
    this.rdvMotif         = '';
    this.buildCalendar();
  }

  closeCalendar(): void { this.showCalendar = false; }

  buildCalendar(): void {
    const firstDay    = new Date(this.calendarYear, this.calendarMonth, 1).getDay();
    const offset      = (firstDay + 6) % 7;
    const daysInMonth = new Date(this.calendarYear, this.calendarMonth + 1, 0).getDate();
    this.calendarDays = [];
    for (let i = 0; i < offset; i++) this.calendarDays.push(null);
    for (let d = 1; d <= daysInMonth; d++) this.calendarDays.push(d);
  }

  prevMonth(): void {
    if (this.calendarMonth === 0) { this.calendarMonth = 11; this.calendarYear--; }
    else this.calendarMonth--;
    this.buildCalendar();
  }

  nextMonth(): void {
    if (this.calendarMonth === 11) { this.calendarMonth = 0; this.calendarYear++; }
    else this.calendarMonth++;
    this.buildCalendar();
  }

  selectDay(day: number | null): void {
    if (!day || this.isPastDay(day) || this.isWeekend(day)) return;
    this.selectedDate = new Date(this.calendarYear, this.calendarMonth, day);
    this.selectedSlot = null;
  }

  selectSlot(slot: string): void {
    if (!this.isSlotTaken(slot)) this.selectedSlot = slot;
  }

  confirmRdv(): void {
    if (!this.selectedDate || !this.selectedSlot || !this.rdvMotif.trim()) return;
    const [h, m] = this.selectedSlot.split(':');
    const d      = new Date(this.selectedDate);
    d.setHours(+h, +m, 0, 0);

    const rdv: RendezVous = {
      id:               0,
      userId:           this.userId,
      nutritionnisteId: this.calendarTarget === 'nutritionniste' ? this.nutritionnisteId : this.coachId,
      dateHeure:        d.toISOString().slice(0, 19),
      motif:            this.rdvMotif.trim(),
      dureeMinutes:     30,
      statut:           'EN_ATTENTE'
    };

    // Show the result screen immediately
    this.confirmationDone  = true;
    this.confirmationError = false;

    this.http.post<RendezVous>(this.rdvApi, rdv).subscribe({
      next: () => {
        this.confirmationError = false;
        if (this.calendarTarget === 'nutritionniste') this.loadRdvNutri();
        else this.loadRdvCoach();
      },
      error: () => {
        this.confirmationError = true;
      }
    });
  }

  resetCalendar(): void {
    this.selectedDate      = null;
    this.selectedSlot      = null;
    this.confirmationDone  = false;
    this.confirmationError = false;
    this.rdvMotif          = '';
  }

  // ── Helpers calendrier ────────────────────────────────────────────────────
  isToday(day: number | null): boolean {
    if (!day) return false;
    const t = new Date();
    return day === t.getDate() && this.calendarMonth === t.getMonth() && this.calendarYear === t.getFullYear();
  }

  isPastDay(day: number | null): boolean {
    if (!day) return false;
    const today = new Date(); today.setHours(0, 0, 0, 0);
    return new Date(this.calendarYear, this.calendarMonth, day) < today;
  }

  isWeekend(day: number | null): boolean {
    if (!day) return false;
    const dow = new Date(this.calendarYear, this.calendarMonth, day).getDay();
    return dow === 0 || dow === 6;
  }

  isSelectedDay(day: number | null): boolean {
    if (!day || !this.selectedDate) return false;
    return day === this.selectedDate.getDate()
      && this.calendarMonth === this.selectedDate.getMonth()
      && this.calendarYear  === this.selectedDate.getFullYear();
  }

  isSlotTaken(slot: string): boolean {
    if (!this.selectedDate) return false;
    const dateStr = this.fmtDate(this.selectedDate);
    const taken   = this.calendarTarget === 'nutritionniste' ? this.takenSlotsNutri : this.takenSlotsCoach;
    return taken.some(t => t.date === dateStr && t.heure === slot);
  }

  fmtDate(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  }

  fmtSelectedDate(): string {
    if (!this.selectedDate) return '';
    return this.selectedDate.toLocaleDateString('fr-FR', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });
  }

  // ── IMC ───────────────────────────────────────────────────────────────────
  getImcPercent(): string {
    if (!this.derniereConsultation) return '0%';
    const pct = Math.min(Math.max(((this.derniereConsultation.imc - 16) / 24) * 100, 0), 100);
    return `${pct.toFixed(1)}%`;
  }

  getImcLabel(): string {
    if (!this.derniereConsultation) return '';
    const v = this.derniereConsultation.imc;
    if (v < 18.5) return 'Insuffisance pondérale';
    if (v < 25)   return 'Poids normal ✓';
    if (v < 30)   return 'Surpoids';
    return 'Obésité';
  }

  // ── Getters tabs ──────────────────────────────────────────────────────────
  get totalRdvNutri(): number {
    return this.rdvNutriEnAttente.length + this.rdvNutriConfirmes.length + this.rdvNutriRefuses.length;
  }

  get totalRdvCoach(): number {
    return this.rdvCoachEnAttente.length + this.rdvCoachConfirmes.length + this.rdvCoachRefuses.length;
  }
}
