import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse
} from '@angular/common/http';

import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';

import { AuthService } from '../services/auth';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private authService: AuthService) { }

  /**
   * Intercepteur HTTP chargé de :
   * - Ajouter automatiquement le token d'authentification aux requêtes sortantes
   * - Gérer l'expiration du token (401)
   * - Rafraîchir le token si nécessaire
   */
  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {

    // Récupération du token stocké
    const token = this.authService.getToken();

    let authReq = req;

    /**
     * Si un token existe, on clone la requête
     * et on ajoute l'en-tête Authorization.
     */
    if (token) {
      authReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }

    /**
     * Envoie de la requête HTTP et interception des erreurs éventuelles.
     */
    return next.handle(authReq).pipe(

      catchError((error: HttpErrorResponse) => {

        /**
         * Évite une boucle infinie si l'erreur provient
         * déjà d'une requête de rafraîchissement de token.
         * Dans ce cas on déconnecte l'utilisateur.
         */
        if (req.url.includes('/token/refresh/')) {
          this.authService.logout();
          return throwError(() => error);
        }

        /**
         * Si le serveur renvoie 401 (token expiré),
         * on tente de récupérer un nouveau token via refreshToken().
         */
        if (error.status === 401) {

          return this.authService.refreshToken().pipe(

            switchMap((response: any) => {

              // Sauvegarde du nouveau access token
              localStorage.setItem('access_token', response.access);

              /**
               * Recrée la requête originale avec le nouveau token
               * puis la renvoie au serveur.
               */
              const newRequest = req.clone({
                setHeaders: {
                  Authorization: `Bearer ${response.access}`
                }
              });

              return next.handle(newRequest);

            }),

            catchError(err => {

              /**
               * Si le refresh token est lui aussi expiré,
               * on déconnecte l'utilisateur.
               */
              this.authService.logout();

              return throwError(() => err);

            })

          );

        }

        // Si l'erreur n'est pas liée à l'authentification, on la renvoie
        return throwError(() => error);

      })

    );

  }

}