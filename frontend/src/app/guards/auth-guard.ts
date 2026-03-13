import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

/**
 * Guard de protection des routes nécessitant une authentification.
 * Vérifie la présence d'un token et s'assure que les informations
 * de l'utilisateur courant sont chargées avant d'autoriser l'accès.
 */
export const AuthGuard: CanActivateFn = (route, state): Observable<boolean | any> => {
    // Injection des services nécessaires
    const authService = inject(AuthService);
    const router = inject(Router);

    // Récupération du token d'authentification
    const token = authService.getToken();

    /**
     * Si aucun token n'est présent,
     * redirige l'utilisateur vers la page de login.
     */
    if (!token) {
        return of(router.createUrlTree(['/auth/login']));
    }

    /**
     * Si les informations de l'utilisateur sont déjà chargées
     * dans le service, l'accès est autorisé immédiatement.
     */
    if (authService.currentUser) {
        return of(true); // User déjà chargé
    }

    /**
     * Si l'utilisateur n'est pas encore chargé :
     * - on appelle l'API pour récupérer ses informations
     * - si un utilisateur est retourné → accès autorisé
     * - sinon → redirection vers la page de login
     */
    return authService.fetchCurrentUser().pipe(
        map(user => !!user || router.createUrlTree(['/auth/login'])),
        catchError(() => of(router.createUrlTree(['/auth/login'])))
    );
};