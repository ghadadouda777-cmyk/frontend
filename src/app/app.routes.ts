import { Routes } from '@angular/router';
import { Acceuil } from './components/acceuil/acceuil';
import { Authentification } from './components/authentification/authentification';
import { InscritNutritionist } from './components/inscrit-nutritionist/inscrit-nutritionist';
import { InscritCoach } from './components/inscrit-coach/inscrit-coach';
import { InscritBloomer } from './components/inscrit-bloomer/inscrit-bloomer';
import { Abonnement } from './components/abonnement/abonnement';
import { RequestMail } from './components/authentification/forget-password/request-mail/request-mail';
import { VerifyCode } from './components/authentification/forget-password/verify-code/verify-code';
import { ResetPassword } from './components/authentification/forget-password/reset-password/reset-password';
import { NutritionistDashboard } from './components/dashboard/nutritionist-dashboard/nutritionist-dashboard/nutritionist-dashboard';

export const routes: Routes = [
  { path: 'Acceuil',                    title: 'Acceuil',         component: Acceuil },
  { path: 'authentification/:role',     title: 'authentification', component: Authentification },
  { path: 'inscrire/nutritionist',      component: InscritNutritionist },
  { path: 'inscrire/coach',             component: InscritCoach },
  { path: 'inscrire/bloomer',           component: InscritBloomer },
  { path: 'abonnement',                 component: Abonnement },          // ← nouveau
  { path: 'dashboard/nutritionist',     component: NutritionistDashboard },
  { path: 'forget-password',            component: RequestMail },
  { path: 'verify-code',               component: VerifyCode },
  { path: 'reset-password',            component: ResetPassword },
  { path: '',                           redirectTo: 'Acceuil', pathMatch: 'full' },
];