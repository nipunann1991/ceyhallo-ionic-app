import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { filter, map, take } from 'rxjs/operators';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router: Router = inject(Router);

  // Using observable stream directly to avoid toObservable() context issues in guards
  return authService.authState$.pipe(
    filter(user => user !== undefined), // Wait until the auth state is determined
    take(1),
    map(user => {
      if (user) {
        return true;
      }

      // Redirect to the login page
      return router.parseUrl('/login');
    })
  );
};