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
  // Dashboards need browser APIs (localStorage, HTTP) — client-side only
  {
    path: 'dashboard/bloomer',
    renderMode: RenderMode.Client
  },
  {
    path: 'dashboard/coach',
    renderMode: RenderMode.Client
  },
  {
    path: 'dashboard/nutritionist',
    renderMode: RenderMode.Client
  },
  {
    path: 'dashboard/:userId',
    renderMode: RenderMode.Client
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];
