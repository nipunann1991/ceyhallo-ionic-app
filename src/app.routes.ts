
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
    path: 'reset-password',
    loadComponent: () => import('./pages/reset-password/reset-password.component').then(m => m.ResetPasswordComponent),
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
        path: 'menu',
        loadComponent: () => import('./pages/quick-links/quick-links.component').then(m => m.QuickLinksComponent),
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
    path: 'list-business',
    loadComponent: () => import('./pages/list-business/list-business.component').then(m => m.ListBusinessComponent),
    canActivate: [authGuard]
  },
  {
    path: 'news',
    loadComponent: () => import('./pages/news/news.component').then(m => m.NewsComponent),
  },
  {
    path: 'news/:id',
    loadComponent: () => import('./pages/news-detail/news-detail.component').then(m => m.NewsDetailComponent),
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
    path: 'business/:id',
    loadComponent: () => import('./pages/business-detail/business-detail.component').then(m => m.BusinessDetailComponent),
  },
  {
    path: 'organizations',
    loadComponent: () => import('./pages/organizations/organizations.component').then(m => m.OrganizationsComponent),
  },
  {
    path: 'organization/:id',
    loadComponent: () => import('./pages/business-detail/business-detail.component').then(m => m.BusinessDetailComponent),
  },
  {
    path: 'events',
    loadComponent: () => import('./pages/events/events.component').then(m => m.EventsComponent),
  },
  {
    path: 'event/:id',
    loadComponent: () => import('./pages/event-detail/event-detail.component').then(m => m.EventDetailComponent),
  },
  {
    path: 'jobs',
    loadComponent: () => import('./pages/jobs/jobs.component').then(m => m.JobsComponent),
  },
  {
    path: 'job/:id',
    loadComponent: () => import('./pages/job-detail/job-detail.component').then(m => m.JobDetailComponent),
  },
  {
    path: 'offers',
    loadComponent: () => import('./pages/offers/offers.component').then(m => m.OffersComponent),
  },
  {
    path: 'navigate',
    loadComponent: () => import('./pages/navigate/navigate.component').then(m => m.NavigateComponent),
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
