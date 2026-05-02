export interface Consultation {
  id: number;
  rendezVousId: number;
  userId: number;
  nutritionnisteId: number;
  coachId?: number;
  poids: number;
  taille: number;
  imc: number;
  objectif: string;
  diagnostic: string;
  recommandations: string;
  notes?: string;
  dateConsultation: string;
  prochainRdv?: string;
  planAlimentaireId?: number;
}