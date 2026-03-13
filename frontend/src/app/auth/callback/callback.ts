import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-auth-callback',
  template: '<p>Connexion en cours...</p>'
})
export class AuthCallback implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {

    this.route.queryParams.subscribe(params => {

      const access = params['access'];
      const refresh = params['refresh'];

      if (access && refresh) {

        // stocker les tokens
        this.authService.setTokens(access, refresh);

        // charger l'utilisateur courant
        this.authService.fetchCurrentUser().subscribe({
          next: () => {
            this.router.navigate(['/dashboard']);
          },
          error: () => {
            window.location.href = 'http://127.0.0.1:8000/users/login/';
          }
        });

      } else {
        window.location.href = 'http://127.0.0.1:8000/users/login/';
      }

    });

  }
}
