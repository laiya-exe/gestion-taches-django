import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})

/**
 * Composant de la barre de navigation principale.
 * - Affiche des liens conditionnés par l'état de connexion.
 * - Permet de se déconnecter via le service `AuthService`.
 */
export class Navbar {
  constructor(public authService: AuthService) { }

  /**
   * Déconnecte l'utilisateur.
   * Appelle la méthode `logout()` du service AuthService,
   * qui supprime les tokens et redirige vers la page de login.
   */
  logout(): void {
    this.authService.logout();
  }
  
}
