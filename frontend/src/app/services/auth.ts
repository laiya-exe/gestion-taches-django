import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { tap } from 'rxjs/operators';
import { catchError } from 'rxjs/operators';



@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = '/api'; // via proxy
  currentUser: any = null;

  constructor(private http: HttpClient, private router: Router) { }

  /**
   * Stocke les tokens d'accès et de rafraîchissement dans le localStorage.
   * Utilisé après une authentification réussie.
   */
  setTokens(access: string, refresh: string): void {
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
  }

  /**
   * Récupère les informations de l'utilisateur courant depuis l'API
   * et les stocke dans la propriété `currentUser`.
   */
  fetchCurrentUser(): Observable<any> {
    return this.http.get('/api/user/').pipe(
      tap(user => this.currentUser = user)
    );
  }

  /**
   * Retourne l'ID de l'utilisateur actuellement connecté.
   */
  getCurrentUserId(): number | null {
    return this.currentUser?.id || null;
  }

  /**
   * Retourne le type de l'utilisateur courant
   * (ex: étudiant, professeur, etc.).
   */
  getCurrentUserType(): string | null {
    return this.currentUser?.user_type || null;
  }

  /**
   * Vérifie si le code s'exécute dans un navigateur
   * pour éviter les erreurs côté serveur.
   */
  private isBrowser(): boolean {
    return typeof window !== 'undefined';
  }

  /**
   * Authentifie un utilisateur avec son username et son mot de passe.
   * Enregistre les tokens reçus dans le localStorage.
   */
  login(username: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/token/`, { username, password })
      .pipe(
        tap((response: any) => {
          if (this.isBrowser()) {
            localStorage.setItem('access_token', response.access);
            localStorage.setItem('refresh_token', response.refresh);
          }
        })
      );
  }

  /**
   * Inscrit un nouvel utilisateur.
   * Sauvegarde les tokens retournés et initialise l'utilisateur courant.
   */
  register(userData: any): Observable<any> {
    return this.http.post('/api/register/', userData).pipe(
      tap((response: any) => {
        localStorage.setItem('access_token', response.access);
        localStorage.setItem('refresh_token', response.refresh);
        this.currentUser = response.user;
      })
    );
  }

  /**
   * Déconnecte l'utilisateur.
   * Supprime les tokens stockés et redirige vers la page de connexion.
   */
  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    this.currentUser = null;

    this.router.navigate(['/login']);
  }
  
  /**
   * Met à jour les informations du profil utilisateur.
   * Met également à jour la propriété `currentUser`.
   */
  updateProfile(formData: FormData): Observable<any> {
    return this.http.put('/api/user/', formData).pipe(
      tap(user => this.currentUser = user)
    );
  }

  /**
   * Change le mot de passe de l'utilisateur.
   * Transforme les erreurs API en message lisible pour l'interface.
   */
  changePassword(oldPassword: string, newPassword: string, confirmPassword: string): Observable<any> {
    const payload = {
      old_password: oldPassword,
      new_password: newPassword,
      confirm_password: confirmPassword
    };

    return this.http.post('/api/user/change-password/', payload).pipe(
      catchError(err => {
        // Ici on transforme l'erreur pour l'afficher correctement dans le composant
        let errorMsg = 'Erreur lors du changement de mot de passe.';
        if (err.error) {
          if (err.error.old_password) {
            errorMsg = err.error.old_password[0];
          } else if (err.error.new_password) {
            errorMsg = err.error.new_password[0];
          } else if (err.error.confirm_password) {
            errorMsg = err.error.confirm_password[0];
          } else if (err.error.detail) {
            errorMsg = err.error.detail;
          }
        }
        return throwError(() => errorMsg);
      })
    );
  }

  /**
   * Rafraîchit le token d'accès en utilisant le refresh token.
   */
  refreshToken(): Observable<any> {
    if (this.isBrowser()) {
      const refresh = localStorage.getItem('refresh_token');
      return this.http.post(`${this.apiUrl}/token/refresh/`, { refresh });
    }
    // Si pas de navigateur, renvoie un observable qui échoue
    return new Observable(observer => {
      observer.error('Refresh token not available on server');
    });
  }


  /**
   * Récupère le token d'accès stocké dans le navigateur.
   */
  getToken(): string | null {
    if (this.isBrowser()) {
      return localStorage.getItem('access_token');
    }
    return null;
  }

  /**
   * Vérifie si l'utilisateur est authentifié.
   * Décode le JWT et vérifie sa date d'expiration.
   */
  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;

    // Décoder le JWT pour vérifier l'expiration
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  }

}
