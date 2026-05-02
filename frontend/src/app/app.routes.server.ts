import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'inscrire/bloomer',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'inscrire/coach',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'inscrire/nutritionist',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'authentification/:role',
    renderMode: RenderMode.Server
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];
