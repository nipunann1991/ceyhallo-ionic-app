import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const APP_ROUTES: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'signup',
    loadComponent: () => import('./pages/signup/signup.component').then(m => m.SignUpComponent),
  },
  {
    path: 'forgot-password',
    loadComponent: () => import('./pages/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent),
  },
  {
    path: 'tabs',
    loadComponent: () => import('./pages/tabs/tabs.component').then(m => m.TabsComponent),
    children: [
      {
        path: 'home',
        loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent),
      },
      {
        path: 'search',
        loadComponent: () => import('./pages/search/search.component').then(m => m.SearchComponent),
      },
      {
        path: 'profile',
        loadComponent: () => import('./pages/profile/profile.component').then(m => m.ProfileComponent),
      },
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: 'notifications',
    loadComponent: () => import('./pages/notifications/notifications.component').then(m => m.NotificationsComponent),
    canActivate: [authGuard]
  },
  {
    path: 'edit-profile',
    loadComponent: () => import('./pages/edit-profile/edit-profile.component').then(m => m.EditProfileComponent),
    canActivate: [authGuard]
  },
  {
    path: 'change-password',
    loadComponent: () => import('./pages/change-password/change-password.component').then(m => m.ChangePasswordComponent),
    canActivate: [authGuard]
  },
  {
    path: 'news',
    loadComponent: () => import('./pages/news/news.component').then(m => m.NewsComponent),
  },
  {
    path: 'restaurants',
    loadComponent: () => import('./pages/restaurants/restaurants.component').then(m => m.RestaurantsComponent),
  },
  {
    path: 'businesses',
    loadComponent: () => import('./pages/businesses/businesses.component').then(m => m.BusinessesComponent),
  },
  {
    path: 'events',
    loadComponent: () => import('./pages/events/events.component').then(m => m.EventsComponent),
  },
  {
    path: 'jobs',
    loadComponent: () => import('./pages/jobs/jobs.component').then(m => m.JobsComponent),
  },
  {
    path: 'navigate',
    loadComponent: () => import('./pages/navigate/navigate.component').then(m => m.NavigateComponent),
  },
  {
    path: 'settings',
    loadComponent: () => import('./pages/settings/settings.component').then(m => m.SettingsComponent),
  },
  {
    path: 'legal/:id',
    loadComponent: () => import('./pages/legal/legal.component').then(m => m.LegalPageComponent),
  },
  {
    path: 'support',
    loadComponent: () => import('./pages/support/support.component').then(m => m.SupportComponent),
  },
  {
    path: '',
    redirectTo: '/tabs/home',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: '/tabs/home',
  },
];