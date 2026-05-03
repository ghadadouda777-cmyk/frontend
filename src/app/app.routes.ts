import { Routes } from '@angular/router';
import { Acceuil } from './components/acceuil/acceuil';
import { Authentification } from './components/authentification/authentification';
import { Abonnement } from './components/abonnement/abonnement';
import { ConversationComponent as Conversation } from './components/conversation/conversation';
import { RequestMail } from './components/authentification/forget-password/request-mail/request-mail';
import { VerifyCode } from './components/authentification/forget-password/verify-code/verify-code';
import { ResetPassword } from './components/authentification/forget-password/reset-password/reset-password';
import { CoachDashboard } from './components/dashboard/coach-dashboard/coach-dashboard/coach-dashboard';
import { PatientDashboard } from './components/dashboard/patient-dashboard/patient-dashboard/patient-dashboard';
import { InscritBloomer } from './components/inscrit/inscrit-bloomer/inscrit-bloomer';
import { InscritCoach } from './components/inscrit/inscrit-coach/inscrit-coach';
import { InscritNutritionist } from './components/inscrit/inscrit-nutritionist/inscrit-nutritionist';
import { NutritionistDashboard } from './components/dashboard/nutritionist-dashboard/nutritionist-dashboard';
import { BloomerDashboard } from './components/dashboard/bloomer-dashboard/bloomer-dashboard';

export const routes: Routes = [
  { path: 'Acceuil', title: 'Acceuil', component: Acceuil },
  { path: 'authentification/:role', title: 'authentification', component: Authentification },
  { path: 'inscrire/nutritionist', component: InscritNutritionist },
  { path: 'inscrire/coach', component: InscritCoach },
  { path: 'inscrire/bloomer', component: InscritBloomer },
  { path: 'abonnement', component: Abonnement },
  { path: 'conversation', component: Conversation },
  { path: 'conversation/:patientId', component: Conversation },
  { path: 'dashboard/nutritionist', component: NutritionistDashboard },
  { path: 'dashboard/coach', component: CoachDashboard },
  { path: 'dashboard/bloomer', component: PatientDashboard },
  { path: 'dashboard/bloomerr', component: BloomerDashboard },
  { path: 'forget-password', component: RequestMail },
  { path: 'verify-code', component: VerifyCode },
  { path: 'reset-password', component: ResetPassword },
  { path: '', redirectTo: 'Acceuil', pathMatch: 'full' },
];