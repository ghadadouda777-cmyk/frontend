import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RendezVousService } from '../../../services/rendez-vous';
import { ConsultationService } from '../../../services/consultation';
import { RendezVous } from '../../../../interfaces/rendez-vous';
import { Consultation } from '../../../../interfaces/consultation';

@Component({
  selector: 'app-nutritionist-dashboard',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './nutritionist-dashboard.html',
  styleUrls: ['./nutritionist-dashboard.css']
})
export class NutritionistDashboard implements OnInit {

  rendezVousEnAttente: RendezVous[] = [];
  rendezVousConfirmes: RendezVous[] = [];
  rendezVousRefuses: RendezVous[] = [];
  consultations: Consultation[] = [];
  selectedConsultation: Consultation | null = null;
  showModal = false;
  activeTab: 'attente' | 'confirme' | 'refuse' = 'attente';
  nutritionnisteId = 1;

  constructor(
    private rdvService: RendezVousService,
    private consultationService: ConsultationService
  ) {}

  ngOnInit(): void {
    this.loadRendezVous();
    this.loadConsultations();
  }

  loadRendezVous(): void {
    this.rdvService.getByNutritionniste(this.nutritionnisteId).subscribe((data: RendezVous[]) => {
      this.rendezVousEnAttente = data.filter(r => r.statut === 'EN_ATTENTE');
      this.rendezVousConfirmes = data.filter(r => r.statut === 'CONFIRME');
      this.rendezVousRefuses   = data.filter(r => r.statut === 'REFUSE');
    });
  }

  loadConsultations(): void {                                           // ✅ fixed
    this.consultationService.getByNutritionniste(this.nutritionnisteId).subscribe((data: Consultation[]) => {
      this.consultations = data;
    });
  }

  accepter(id: number): void {
    this.rdvService.accepter(id).subscribe(() => this.loadRendezVous());
  }

  refuser(id: number): void {
    this.rdvService.refuser(id).subscribe(() => this.loadRendezVous());
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
}