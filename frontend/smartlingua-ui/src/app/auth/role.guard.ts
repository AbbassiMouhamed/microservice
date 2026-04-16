import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const requireRoles = (...roles: string[]): CanActivateFn => {
  return () => {
    const auth = inject(AuthService);
    if (auth.hasAnyRole(...roles)) return true;

    const router = inject(Router);
    return router.parseUrl('/exams');
  };
};
