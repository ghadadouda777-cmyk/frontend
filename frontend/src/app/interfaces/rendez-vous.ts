export interface RendezVous {
  id: number;
  dateHeure: string;
  statut: 'EN_ATTENTE' | 'CONFIRME' | 'REFUSE' | 'TERMINE';
  motif: string;
  notes?: string;
  dureeMinutes: number;
  userId: number;
  nutritionnisteId: number;
  coachId?: number;
  typeIntervenant?: string;
}