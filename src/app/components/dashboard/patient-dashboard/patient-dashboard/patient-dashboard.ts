import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { Router } from '@angular/router';
import { RendezVousService } from '../../../services/rendez-vous';
import { ConsultationService } from '../../../services/consultation';
import { RendezVous } from '../../../../interfaces/rendez-vous';
import { Consultation } from '../../../../interfaces/consultation';

@Component({
  selector: 'app-patient-dashboard',
  standalone: true,
  imports: [CommonModule, DatePipe, DecimalPipe],
  templateUrl: './patient-dashboard.html',
  styleUrls: ['./patient-dashboard.css']
})
export class PatientDashboard implements OnInit {

  rdvEnAttente: RendezVous[]  = [];
  rdvConfirmes: RendezVous[]  = [];
  rdvRefuses:   RendezVous[]  = [];

  consultations:        Consultation[]      = [];
  derniereConsultation: Consultation | null = null;
  selectedConsultation: Consultation | null = null;
  showModal = false;

  activeTab: 'attente' | 'confirme' | 'refuse' = 'attente';

  userId = 1;

  constructor(
    private rdvService:          RendezVousService,
    private consultationService: ConsultationService,
    private router:              Router
  ) {}

  ngOnInit(): void {
    this.loadRendezVous();
    this.loadConsultations();
  }

  loadRendezVous(): void {
    this.rdvService.getAll().subscribe((data: RendezVous[]) => {
      const mine        = data.filter(r => r.userId === this.userId);
      this.rdvEnAttente = mine.filter(r => r.statut === 'EN_ATTENTE');
      this.rdvConfirmes = mine.filter(r => r.statut === 'CONFIRME');
      this.rdvRefuses   = mine.filter(r => r.statut === 'REFUSE');
    });
  }

  loadConsultations(): void {
    this.consultationService.getAll().subscribe((data: Consultation[]) => {
      this.consultations = data
        .filter(c => c.userId === this.userId)
        .sort((a, b) => new Date(b.dateConsultation).getTime() - new Date(a.dateConsultation).getTime());
      this.derniereConsultation = this.consultations[0] ?? null;
    });
  }

  openConsultation(id: number): void {
    this.consultationService.getById(id).subscribe((data: Consultation) => {
      this.selectedConsultation = data;
      this.showModal = true;
    });
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedConsultation = null;
  }

  setTab(tab: 'attente' | 'confirme' | 'refuse'): void {
    this.activeTab = tab;
  }

  goToPrendreRdv(): void {
    this.router.navigate(['/dashboard/bloomer']);
  }

  goToMessages(): void {
    this.router.navigate(['/Acceuil']);
  }

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
}
