import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  userData = {
    username: '',
    email: '',
    password: '',
    user_type: 'etudiant'  // valeur par défaut
  };
  error = '';

  constructor(private authService: AuthService, private router: Router) {}

  /**
   * Gestion de la soumission du formulaire d'inscription.
   * - Appelle le service d'authentification pour créer un nouvel utilisateur avec `userData`.
   * - En cas de succès, redirige l'utilisateur vers le dashboard.
   * - En cas d'erreur, met à jour la variable `error` pour affichage côté UI.
   */
  onSubmit(): void {
    this.authService.register(this.userData).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.error = err.error?.message || 'Erreur lors de l\'inscription';
      }
    });
  }
}