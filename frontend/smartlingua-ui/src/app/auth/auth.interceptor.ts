import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, from, switchMap } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private readonly auth: AuthService) {}

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Only attach tokens for our backend API calls (same-origin /api/*)
    const url = new URL(req.url, window.location.origin);
    if (url.origin !== window.location.origin || !url.pathname.startsWith('/api')) {
      return next.handle(req);
    }

    return from(this.auth.getValidToken()).pipe(
      switchMap((token) => {
        if (!token) return next.handle(req);

        const authReq = req.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`,
          },
        });
        return next.handle(authReq);
      }),
    );
  }
}
