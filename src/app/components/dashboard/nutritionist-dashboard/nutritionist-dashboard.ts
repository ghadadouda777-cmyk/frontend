import { Component, OnInit, NgZone, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { RendezVousService } from '../../../services/rendez-vous';
import { ConsultationService } from '../../../services/consultation';
<<<<<<< HEAD:src/app/components/dashboard/nutritionist-dashboard/nutritionist-dashboard/nutritionist-dashboard.ts
import { RendezVous } from '../../../../interfaces/rendez-vous';
import { Consultation } from '../../../../interfaces/consultation';
import { ConversationComponent } from '../../../conversation/conversation';
=======
import { RendezVous } from '../../../interfaces/rendez-vous';
import { Consultation } from '../../../interfaces/consultation';
>>>>>>> 3c84e5d6c7bf34b95261a2f8cf51ac964a1cd202:src/app/components/dashboard/nutritionist-dashboard/nutritionist-dashboard.ts

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
  imports: [CommonModule, DatePipe, FormsModule, ConversationComponent],
  templateUrl: './nutritionist-dashboard.html',
  styleUrls: ['./nutritionist-dashboard.css']
})
export class NutritionistDashboard implements OnInit {

  rendezVousEnAttente: RendezVous[] = [];
  rendezVousConfirmes: RendezVous[] = [];
  rendezVousRefuses: RendezVous[] = [];
  upcomingRdv: UpcomingRdv[] = [];

  activeTab: 'attente' | 'confirme' | 'refuse' = 'attente';

  nutritionnisteId: string = '';

  consultations: Consultation[] = [];
  selectedConsultation: Consultation | null = null;

  // ✅ NOUVEAU : RDV sélectionné pour ouvrir le plan sans consultation existante
  selectedRdv: RendezVous | null = null;

  showModal = false;
  activeModalTab: 'details' | 'plan' = 'details';

  planForm: PlanForm = this.emptyPlan();
  planLoading = false;
  planSuccess = '';
  planError = '';

  showRapportModal = false;
  rapportConsultation: Consultation | null = null;

  activePage: string = 'dashboard';

  selectedPatientId: number | null = null;

  activeParamsTab: 'compte' | 'securite' | 'notifs' | 'prefs' = 'compte';
  paramSuccess = '';
  paramError = '';

  profileForm = {
    prenom: '',
    nom: '',
    email: '',
    telephone: '',
    specialite: 'Nutritionniste clinique',
    bio: ''
  };

  passwordForm = {
    ancien: '',
    nouveau: '',
    confirmer: ''
  };

  notifPrefs = {
    emailRdv: true,
    emailMessage: true,
    emailRapport: false,
    smsRdv: true,
    smsMessage: false
  };

  displayPrefs = {
    langue: 'fr',
    theme: 'light'
  };

  previewTheme: string = 'light';
  previewLangue: string = 'fr';

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
  private readonly PREFS_KEY = 'nutripro_prefs';

  constructor(
    private rdvService: RendezVousService,
    private consultationService: ConsultationService,
    private http: HttpClient,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.nutritionnisteId = localStorage.getItem('userId') ?? '';
    console.log('✅ nutritionnisteId =', this.nutritionnisteId);

    const nom    = localStorage.getItem('nom')    || '';
    const prenom = localStorage.getItem('prenom') || '';
    this.profileForm.nom    = nom;
    this.profileForm.prenom = prenom;

    if (!this.nutritionnisteId) {
      this.router.navigate(['/authentification/nutritionist']);
      return;
    }

    this.loadRendezVous();
    this.loadConsultations();
    this.loadSavedPrefs();
  }

  loadRendezVous(): void {
    console.log('📡 loadRendezVous avec id:', this.nutritionnisteId);
    this.rdvService.getByNutritionniste(this.nutritionnisteId).subscribe({
      next: (data: RendezVous[]) => {
        console.log('📦 RDV reçus:', data);
        this.ngZone.run(() => {
          this.rendezVousEnAttente = data.filter(r => r.statut === 'EN_ATTENTE');
          this.rendezVousConfirmes = data.filter(r => r.statut === 'CONFIRME');
          this.rendezVousRefuses  = data.filter(r => r.statut === 'REFUSE');
          this.buildUpcomingRdv(data);
          console.log('✅ En attente:', this.rendezVousEnAttente.length);
          console.log('✅ Confirmés:', this.rendezVousConfirmes.length);
          console.log('✅ Refusés:', this.rendezVousRefuses.length);
          this.cdr.detectChanges();
        });
      },
      error: (err: any) => {
        console.error('❌ Erreur loadRendezVous:', err);
      }
    });
  }

  loadConsultations(): void {
    this.http.get<Consultation[]>(`${this.apiUrl}/consultations/nutritionniste/${this.nutritionnisteId}`)
      .subscribe({
        next: (data: Consultation[]) => {
          this.ngZone.run(() => {
            this.consultations = data;
            console.log('✅ Consultations reçues:', data.length);
            this.cdr.detectChanges();
          });
        },
        error: (err) => {
          console.error('❌ Erreur loadConsultations - status:', err.status, 'url:', err.url);
          this.http.get<Consultation[]>(`${this.apiUrl}/consultations/by-nutritionniste/${this.nutritionnisteId}`)
            .subscribe({
              next: (data: Consultation[]) => {
                this.ngZone.run(() => {
                  this.consultations = data;
                  this.cdr.detectChanges();
                });
              },
              error: (err2) => {
                console.error('❌ Endpoint alternatif aussi échoué:', err2.status);
              }
            });
        }
      });
  }

  // ✅ CORRIGÉ : comparaison robuste UUID/string
  getConsultationByUserId(userId: any): Consultation | undefined {
    return this.consultations.find(c =>
      String(c.userId).toLowerCase().trim() ===
      String(userId).toLowerCase().trim()
    );
  }

  // ✅ NOUVEAU : ouvre le modal Plan depuis un RDV confirmé
  // - Si consultation existante → affiche détails + onglet plan
  // - Sinon → ouvre directement le formulaire plan alimentaire
  openPlanModal(rdv: RendezVous): void {
    this.selectedRdv = rdv;
    const existing = this.getConsultationByUserId(rdv.userId);
    if (existing) {
      this.openConsultation(existing.id);
    } else {
      this.ngZone.run(() => {
        this.selectedConsultation = null;
        this.showModal = true;
        this.activeModalTab = 'plan';
        this.planForm = this.emptyPlan();
        this.planSuccess = '';
        this.planError = '';
        this.cdr.detectChanges();
      });
    }
  }

  private buildUpcomingRdv(all: RendezVous[]): void {
    const now = new Date();
    const weekEnd = new Date(now);
    weekEnd.setDate(now.getDate() + 30);
    this.upcomingRdv = all
      .filter(r => { const d = new Date(r.dateHeure); return d >= now && d <= weekEnd; })
      .sort((a, b) => new Date(a.dateHeure).getTime() - new Date(b.dateHeure).getTime())
      .slice(0, 6)
      .map((rdv, i) => ({
        ...rdv,
        dotColor: this.dotColors[i % this.dotColors.length],
        badgeColor: this.badgeColors[i % this.badgeColors.length]
      }));
  }

  setPage(page: string): void {
    this.activePage = page;
    this.paramSuccess = '';
    this.paramError = '';
    if (page === 'params') {
      this.previewTheme = this.displayPrefs.theme;
      this.previewLangue = this.displayPrefs.langue;
    }
  }

  goToConversation(): void {
    this.selectedPatientId = null;
    this.activePage = 'conv';
  }

  openConversation(userId: any): void {
    this.selectedPatientId = userId;
    this.activePage = 'conv';
  }

  setParamsTab(tab: 'compte' | 'securite' | 'notifs' | 'prefs'): void {
    this.activeParamsTab = tab;
    this.paramSuccess = '';
    this.paramError = '';
    if (tab === 'prefs') {
      this.previewTheme = this.displayPrefs.theme;
      this.previewLangue = this.displayPrefs.langue;
    }
  }

  saveProfile(): void {
    this.paramSuccess = 'Profil mis à jour avec succès !';
    this.paramError = '';
    setTimeout(() => this.paramSuccess = '', 3000);
  }

  savePassword(): void {
    if (!this.passwordForm.ancien || !this.passwordForm.nouveau || !this.passwordForm.confirmer) {
      this.paramError = 'Veuillez remplir tous les champs.';
      return;
    }
    if (this.passwordForm.nouveau !== this.passwordForm.confirmer) {
      this.paramError = 'Les nouveaux mots de passe ne correspondent pas.';
      return;
    }
    if (this.passwordForm.nouveau.length < 8) {
      this.paramError = 'Le mot de passe doit contenir au moins 8 caractères.';
      return;
    }
    this.paramSuccess = 'Mot de passe modifié avec succès !';
    this.paramError = '';
    this.passwordForm = { ancien: '', nouveau: '', confirmer: '' };
    setTimeout(() => this.paramSuccess = '', 3000);
  }

  saveNotifs(): void {
    this.paramSuccess = 'Préférences de notifications enregistrées !';
    setTimeout(() => this.paramSuccess = '', 3000);
  }

  loadSavedPrefs(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    try {
      const saved = localStorage.getItem(this.PREFS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        this.displayPrefs = { ...this.displayPrefs, ...parsed };
      }
    } catch (e) { }
    this.applyTheme(this.displayPrefs.theme);
    this.applyLangue(this.displayPrefs.langue);
    this.previewTheme = this.displayPrefs.theme;
    this.previewLangue = this.displayPrefs.langue;
  }

  onThemeChange(value: string): void {
    this.previewTheme = value;
    this.displayPrefs.theme = value;
    this.applyTheme(value);
  }

  onLangueChange(value: string): void {
    this.previewLangue = value;
    this.displayPrefs.langue = value;
    this.applyLangue(value);
  }

  savePrefs(): void {
    this.displayPrefs.theme = this.previewTheme;
    this.displayPrefs.langue = this.previewLangue;
    try {
      localStorage.setItem(this.PREFS_KEY, JSON.stringify(this.displayPrefs));
    } catch (e) {
      this.paramError = 'Impossible de sauvegarder les préférences.';
      return;
    }
    this.applyTheme(this.displayPrefs.theme);
    this.applyLangue(this.displayPrefs.langue);
    this.paramSuccess = 'Préférences enregistrées avec succès !';
    this.paramError = '';
    setTimeout(() => this.paramSuccess = '', 3000);
  }

  private applyTheme(theme: string): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const root = document.documentElement;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    let isDark = theme === 'dark' || (theme === 'auto' && prefersDark);
    root.setAttribute('data-theme', isDark ? 'dark' : 'light');
  }

  private applyLangue(langue: string): void {
    if (!isPlatformBrowser(this.platformId)) return;
    document.documentElement.setAttribute('lang', langue);
  }

  logout(): void {
    if (confirm('Voulez-vous vraiment vous déconnecter ?')) {
      localStorage.clear();
      sessionStorage.clear();
      this.router.navigate(['/authentification/nutritionist']);
    }
  }

  accepter(id: number): void {
    this.rdvService.accepter(id).subscribe(() => this.loadRendezVous());
  }

  refuser(id: number): void {
    this.rdvService.refuser(id).subscribe(() => this.loadRendezVous());
  }

  setTab(tab: 'attente' | 'confirme' | 'refuse'): void {
    this.activeTab = tab;
  }

  openRapport(consultationId: number): void {
    this.consultationService.getById(consultationId).subscribe((data: Consultation) => {
      this.ngZone.run(() => {
        this.rapportConsultation = data;
        this.showRapportModal = true;
        this.cdr.detectChanges();
      });
    });
  }

  closeRapportModal(): void {
    this.ngZone.run(() => {
      this.showRapportModal = false;
      this.rapportConsultation = null;
      this.cdr.detectChanges();
    });
  }

  printRapport(): void { window.print(); }

  openConsultation(id: number): void {
    this.consultationService.getById(id).subscribe((data: Consultation) => {
      this.ngZone.run(() => {
        this.selectedConsultation = data;
        this.showModal = true;
        this.activeModalTab = 'details';
        this.planForm = this.emptyPlan();
        this.planSuccess = '';
        this.planError = '';
        this.cdr.detectChanges();
      });
    });
  }

  closeModal(): void {
    this.ngZone.run(() => {
      this.showModal = false;
      this.selectedConsultation = null;
      this.selectedRdv = null;
      this.cdr.detectChanges();
    });
  }

  setModalTab(tab: 'details' | 'plan'): void { this.activeModalTab = tab; }
  addRepas(): void { this.planForm.repas.push(this.emptyRepas()); }
  removeRepas(index: number): void { this.planForm.repas.splice(index, 1); }

  savePlan(): void {
    if (this.planLoading) return;
    if (!this.planForm.nom.trim()) { this.planError = 'Le nom du plan est obligatoire.'; return; }
    if (this.planForm.repas.length === 0) { this.planError = 'Ajoutez au moins un repas.'; return; }

    this.planLoading = true;
    this.planError = '';
    this.planSuccess = '';

    // ✅ CORRIGÉ : utilise selectedRdv comme fallback si pas de consultation
    const payload = {
      nom: this.planForm.nom,
      description: this.planForm.description,
      dateDebut: this.planForm.dateDebut || null,
      dateFin: this.planForm.dateFin || null,
      caloriesJournalieres: this.planForm.caloriesJournalieres,
      objectif: this.planForm.objectif,
      nutritionnisteId: this.nutritionnisteId,
      userId: this.selectedConsultation?.userId ?? this.selectedRdv?.userId ?? null,
      consultationId: this.selectedConsultation?.id ?? null,
      rendezVousId: this.selectedRdv?.id ?? null,
      repas: this.planForm.repas
    };

    this.http.post<any>(`${this.apiUrl}/plans-alimentaires`, payload)
      .pipe(finalize(() => this.ngZone.run(() => this.planLoading = false)))
      .subscribe({
        next: () => this.ngZone.run(() => {
          this.planSuccess = 'Plan enregistré avec succès !';
          this.planForm = this.emptyPlan();
          this.loadConsultations();
          setTimeout(() => this.closeModal(), 1500);
        }),
        error: (err) => this.ngZone.run(() => {
          this.planError = err.error?.message || err.error?.error || 'Erreur lors de l\'enregistrement.';
        })
      });
  }

  getInitials(userId: any): string { return 'P' + String(userId).substring(0, 4); }

  imcClass(imc: number): string {
    if (imc < 18.5) return 'imc-low';
    if (imc < 25)   return 'imc-normal';
    if (imc < 30)   return 'imc-overweight';
    return 'imc-obese';
  }

  imcLabel(imc: number): string {
    if (imc < 18.5) return 'Insuffisance pondérale';
    if (imc < 25)   return 'Poids normal';
    if (imc < 30)   return 'Surpoids';
    return 'Obésité';
  }

  private emptyPlan(): PlanForm {
    return {
      nom: '', description: '', dateDebut: '', dateFin: '',
      caloriesJournalieres: null, objectif: 'Perte de poids',
      repas: [this.emptyRepas()]
    };
  }

  private emptyRepas(): RepasForm {
    return {
      typeRepas: 'Petit-déjeuner', nom: '', aliments: '',
      calories: null, proteines: null, glucides: null, lipides: null, notes: ''
    };
  }
}