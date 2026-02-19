

import { bootstrapApplication } from '@angular/platform-browser';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, withHashLocation } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideIonicAngular } from '@ionic/angular/standalone';

import { AppComponent } from './src/app.component';
import { APP_ROUTES } from './src/app.routes';

bootstrapApplication(AppComponent, {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter(APP_ROUTES, withHashLocation()),
    provideHttpClient(withFetch()),
    provideIonicAngular({
      mode: 'md' // Material Design mode for a consistent look
    })
  ],
}).catch(err => console.error('Bootstrap error:', err?.message || 'Unknown error'));

// AI Studio always uses an `index.tsx` file for all project types.
