import Keycloak, { KeycloakInstance } from 'keycloak-js';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly keycloak: KeycloakInstance;
  private authenticated = false;

  constructor() {
    this.keycloak = new Keycloak({
      url: 'http://localhost:8180',
      realm: 'smartlingua',
      clientId: 'smartlingua-ui',
    });
  }

  async init(): Promise<void> {
    const authenticated = await this.keycloak.init({
      onLoad: 'login-required',
      pkceMethod: 'S256',
      checkLoginIframe: false,
    });
    this.authenticated = authenticated;
  }

  get isAuthenticated(): boolean {
    return this.authenticated;
  }

  get username(): string | undefined {
    return (this.keycloak.tokenParsed as any)?.preferred_username;
  }

  get roles(): string[] {
    return ((this.keycloak.tokenParsed as any)?.realm_access?.roles ?? []) as string[];
  }

  async getValidToken(): Promise<string | null> {
    if (!this.authenticated) return null;

    // Refresh if token is close to expiry
    await this.keycloak.updateToken(30);
    return this.keycloak.token ?? null;
  }

  logout(): void {
    void this.keycloak.logout({ redirectUri: window.location.origin });
  }
}
