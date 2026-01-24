import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { toObservable } from '@angular/core/rxjs-interop';
import { filter, map, take } from 'rxjs/operators';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  // FIX: Explicitly type injected Router to resolve type inference issue.
  const router: Router = inject(Router);

  return toObservable(authService.isLoggedIn).pipe(
    filter(isLoggedIn => isLoggedIn !== undefined), // Wait until the auth state is determined
    take(1),
    map(isLoggedIn => {
      if (isLoggedIn) {
        return true;
      }

      // Redirect to the login page
      return router.parseUrl('/login');
    })
  );
};
