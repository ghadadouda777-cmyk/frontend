export interface RendezVous {
  patientNom: any;
  id: number;
  userId: string;
  nutritionnisteId: string;  // ← vérifie que c'est bien ce nom dans la réponse JSON
  coachId?: string;
  typeIntervenant: string;
  dateHeure: string;
  motif: string;
  dureeMinutes: number;
  statut: 'EN_ATTENTE' | 'CONFIRME' | 'REFUSE' | 'TERMINE';
}