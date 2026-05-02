import { Component, OnInit, NgZone } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { RendezVousService } from '../../../services/rendez-vous';
import { ConsultationService } from '../../../services/consultation';
import { RendezVous } from '../../../../interfaces/rendez-vous';
import { Consultation } from '../../../../interfaces/consultation';

export interface RepasForm {
  typeRepas: string;
  nom: string;
  aliments: string;
  calories: number | null;
  proteines: number | null;
  glucides: number | null;
  lipides: number | null;
  notes: string;
}

export interface PlanForm {
  nom: string;
  description: string;
  dateDebut: string;
  dateFin: string;
  caloriesJournalieres: number | null;
  objectif: string;
  repas: RepasForm[];
}

export interface UpcomingRdv extends RendezVous {
  dotColor: string;
  badgeColor: string;
}

@Component({
  selector: 'app-nutritionist-dashboard',
  standalone: true,
  imports: [CommonModule, DatePipe, FormsModule],
  templateUrl: './nutritionist-dashboard.html',
  styleUrls: ['./nutritionist-dashboard.css']
})
export class NutritionistDashboard implements OnInit {

  rendezVousEnAttente: RendezVous[] = [];
  rendezVousConfirmes: RendezVous[] = [];
  rendezVousRefuses: RendezVous[] = [];
  upcomingRdv: UpcomingRdv[] = [];

  activeTab: 'attente' | 'confirme' | 'refuse' = 'confirme';
  nutritionnisteId = 1;

  consultations: Consultation[] = [];
  selectedConsultation: Consultation | null = null;

  // Consultation/Plan modal
  showModal = false;
  activeModalTab: 'details' | 'plan' = 'details';

  planForm: PlanForm = this.emptyPlan();
  planLoading = false;
  planSuccess = '';
  planError = '';

  // Rapport modal
  showRapportModal = false;
  rapportConsultation: Consultation | null = null;

  activePage: string = 'dashboard';

  objectifOptions = [
    'Perte de poids',
    'Prise de masse',
    'Équilibre alimentaire',
    'Diabète / glycémie',
    'Sportif haute performance'
  ];

  repasTypeOptions = [
    'Petit-déjeuner',
    'Collation matin',
    'Déjeuner',
    'Collation après-midi',
    'Dîner'
  ];

  private readonly dotColors = ['dot-sage', 'dot-plum', 'dot-amber', 'dot-rose'];
  private readonly badgeColors = ['badge-sage', 'badge-plum', 'badge-amber', 'badge-rose'];
  private readonly apiUrl = 'http://localhost:8084/api';

  constructor(
    private rdvService: RendezVousService,
    private consultationService: ConsultationService,
    private http: HttpClient,
    private ngZone: NgZone,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadRendezVous();
    this.loadConsultations();
  }

  // ── DATA LOADING ──────────────────────────────────────────────────────────

  loadRendezVous(): void {
    this.rdvService.getByNutritionniste(this.nutritionnisteId).subscribe((data: RendezVous[]) => {
      this.rendezVousEnAttente = data.filter(r => r.statut === 'EN_ATTENTE');
      this.rendezVousConfirmes = data.filter(r => r.statut === 'CONFIRME');
      this.rendezVousRefuses = data.filter(r => r.statut === 'REFUSE');
      this.buildUpcomingRdv(data);
    });
  }

  loadConsultations(): void {
    this.consultationService.getByNutritionniste(this.nutritionnisteId).subscribe((data: Consultation[]) => {
      this.consultations = data;
    });
  }

  /** Build a decorated list for the "Cette semaine" sidebar panel */
  private buildUpcomingRdv(all: RendezVous[]): void {
    const now = new Date();
    const weekEnd = new Date(now);
    weekEnd.setDate(now.getDate() + 7);

    this.upcomingRdv = all
      .filter(r => {
        const d = new Date(r.dateHeure);
        return d >= now && d <= weekEnd;
      })
      .sort((a, b) => new Date(a.dateHeure).getTime() - new Date(b.dateHeure).getTime())
      .slice(0, 6)
      .map((rdv, i) => ({
        ...rdv,
        dotColor: this.dotColors[i % this.dotColors.length],
        badgeColor: this.badgeColors[i % this.badgeColors.length]
      }));
  }

  // ── NAVIGATION ────────────────────────────────────────────────────────────

  setPage(page: string): void {
    this.activePage = page;
  }

  goToConversation(): void {
    console.log('Navigating to conversation');
    this.router.navigate(['/conversation']);
  }

  // ── ACTIONS ───────────────────────────────────────────────────────────────

  accepter(id: number): void {
    this.rdvService.accepter(id).subscribe(() => this.loadRendezVous());
  }

  refuser(id: number): void {
    this.rdvService.refuser(id).subscribe(() => this.loadRendezVous());
  }

  setTab(tab: 'attente' | 'confirme' | 'refuse'): void {
    this.activeTab = tab;
  }

  openConversation(userId: number): void {
    console.log('Conversation patient', userId);
  }

  openParametres(consultationId: number): void {
    console.log('Paramètres consultation', consultationId);
  }

  // ── RAPPORT MODAL ─────────────────────────────────────────────────────────

  openRapport(consultationId: number): void {
    this.consultationService.getById(consultationId).subscribe((data: Consultation) => {
      this.ngZone.run(() => {
        this.rapportConsultation = data;
        this.showRapportModal = true;
      });
    });
  }

  closeRapportModal(): void {
    this.ngZone.run(() => {
      this.showRapportModal = false;
      this.rapportConsultation = null;
    });
  }

  printRapport(): void {
    window.print();
  }

  // ── CONSULTATION MODAL ────────────────────────────────────────────────────

  openConsultation(id: number): void {
    this.consultationService.getById(id).subscribe((data: Consultation) => {
      this.ngZone.run(() => {
        this.selectedConsultation = data;
        this.showModal = true;
        this.activeModalTab = 'details';
        this.planForm = this.emptyPlan();
        this.planSuccess = '';
        this.planError = '';
      });
    });
  }

  closeModal(): void {
    this.ngZone.run(() => {
      this.showModal = false;
      this.selectedConsultation = null;
    });
  }

  setModalTab(tab: 'details' | 'plan'): void {
    this.activeModalTab = tab;
  }

  // ── REPAS ─────────────────────────────────────────────────────────────────

  addRepas(): void {
    this.planForm.repas.push(this.emptyRepas());
  }

  removeRepas(index: number): void {
    this.planForm.repas.splice(index, 1);
  }

  // ── SAVE PLAN ─────────────────────────────────────────────────────────────

  savePlan(): void {
    if (this.planLoading) return;

    if (!this.planForm.nom.trim()) {
      this.planError = 'Le nom du plan est obligatoire.';
      return;
    }
    if (this.planForm.repas.length === 0) {
      this.planError = 'Ajoutez au moins un repas.';
      return;
    }

    this.planLoading = true;
    this.planError = '';
    this.planSuccess = '';

    const payload = {
      nom: this.planForm.nom,
      description: this.planForm.description,
      dateDebut: this.planForm.dateDebut || null,
      dateFin: this.planForm.dateFin || null,
      caloriesJournalieres: this.planForm.caloriesJournalieres,
      objectif: this.planForm.objectif,
      nutritionnisteId: this.nutritionnisteId,
      userId: this.selectedConsultation?.userId ?? null,
      consultationId: this.selectedConsultation?.id ?? null,
      repas: this.planForm.repas
    };

    this.http.post<any>(`${this.apiUrl}/plans-alimentaires`, payload)
      .pipe(finalize(() => this.ngZone.run(() => this.planLoading = false)))
      .subscribe({
        next: () => {
          this.ngZone.run(() => {
            this.planSuccess = 'Plan enregistré avec succès !';
            this.planForm = this.emptyPlan();
            this.loadConsultations();
            setTimeout(() => this.closeModal(), 1500);
          });
        },
        error: (err) => {
          this.ngZone.run(() => {
            this.planError = err.error?.message || err.error?.error || 'Erreur lors de l\'enregistrement.';
          });
        }
      });
  }

  // ── HELPERS ───────────────────────────────────────────────────────────────

  getInitials(userId: number): string {
    return 'P' + userId;
  }

  imcClass(imc: number): string {
    if (imc < 18.5) return 'imc-low';
    if (imc < 25) return 'imc-normal';
    if (imc < 30) return 'imc-overweight';
    return 'imc-obese';
  }

  imcLabel(imc: number): string {
    if (imc < 18.5) return 'Insuffisance pondérale';
    if (imc < 25) return 'Poids normal';
    if (imc < 30) return 'Surpoids';
    return 'Obésité';
  }

  private emptyPlan(): PlanForm {
    return {
      nom: '',
      description: '',
      dateDebut: '',
      dateFin: '',
      caloriesJournalieres: null,
      objectif: 'Perte de poids',
      repas: [this.emptyRepas()]
    };
  }

  private emptyRepas(): RepasForm {
    return {
      typeRepas: 'Petit-déjeuner',
      nom: '',
      aliments: '',
      calories: null,
      proteines: null,
      glucides: null,
      lipides: null,
      notes: ''
    };
  }
}