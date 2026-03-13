import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, FormGroup } from '@angular/forms';
import { AuthService } from '../../services/auth';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login implements OnInit {

  loginForm!: FormGroup;
  error = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) { }

  /**
  * Initialisation du composant Login.
  * Crée le formulaire réactif avec les champs 'username' et 'password'.
  */
  ngOnInit(): void {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  /**
   * Gestion de la soumission du formulaire de login.
   * - Vérifie si le formulaire est valide.
   * - Appelle le service d'authentification pour se connecter.
   * - En cas de succès, récupère l'utilisateur courant et redirige vers le dashboard.
   * - En cas d'erreur, met à jour la variable 'error' pour affichage côté UI.
   */
  onSubmit(): void {
    if (this.loginForm.invalid) return;

    const { username, password } = this.loginForm.value;

    this.authService.login(username!, password!).subscribe({
      next: () => {
        this.authService.fetchCurrentUser().subscribe(() => {
          this.router.navigate(['/dashboard']);
        });
      },
      error: () => {
        this.error = "Nom d'utilisateur ou mot de passe incorrect.";
      }
    });
  }
}