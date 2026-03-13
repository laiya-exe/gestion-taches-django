import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile implements OnInit {
  profileForm!: FormGroup;
  passwordForm!: FormGroup;
  loading = false;
  message = '';
  error = '';
  selectedFile: File | null = null;

  constructor(
    private fb: FormBuilder,
    public authService: AuthService,
    private router: Router
  ) { }

  /**
   * Initialisation du composant Profile.
   * - Crée les formulaires réactifs pour le profil et le mot de passe.
   * - Récupère les informations de l'utilisateur courant et les injecte dans le formulaire.
   */
  ngOnInit(): void {
    this.profileForm = this.fb.group({
      username: [{ value: '', disabled: true }],
      email: ['', [Validators.required, Validators.email]],
      first_name: [''],
      last_name: ['']
    });

    this.passwordForm = this.fb.group({
      old_password: ['', Validators.required],
      new_password: ['', Validators.required],
      confirm_password: ['', Validators.required]
    });

    if (this.authService.currentUser) {
      this.profileForm.patchValue(this.authService.currentUser);
    } else {
      this.authService.fetchCurrentUser().subscribe({
        next: (user) => this.profileForm.patchValue(user),
        error: (err) => console.error(err)
      });
    }
  }

  /**
   * Gestion de la sélection d'un fichier (avatar).
   * @param event Événement déclenché par l'input file.
   * Stocke le fichier sélectionné dans `selectedFile`.
   */
  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0];
  }

  /**
   * Met à jour les informations du profil utilisateur.
   * - Vérifie la validité du formulaire.
   * - Prépare un FormData avec les champs modifiables et l'avatar éventuel.
   * - Appelle le service pour mettre à jour le profil.
   * - Met à jour le formulaire et affiche un message de succès ou d'erreur.
   */
  updateProfile(): void {
    if (this.profileForm.invalid) return;

    this.loading = true;

    const formData = new FormData();
    formData.append('email', this.profileForm.get('email')?.value);
    formData.append('first_name', this.profileForm.get('first_name')?.value);
    formData.append('last_name', this.profileForm.get('last_name')?.value);

    if (this.selectedFile) {
      formData.append('avatar', this.selectedFile);
    }

    this.authService.updateProfile(formData).subscribe({
      next: () => {
        this.authService.fetchCurrentUser().subscribe(user => {
          this.profileForm.patchValue(user);
          this.message = 'Profil mis à jour avec succès.';
          this.loading = false;
        });
      },
      error: (err) => {
        this.error = 'Erreur lors de la mise à jour.';
        this.loading = false;
      }
    });
  }

  /**
   * Modifie le mot de passe de l'utilisateur.
   * - Vérifie la validité du formulaire.
   * - Appelle le service pour changer le mot de passe avec les anciens et nouveaux mots de passe.
   * - Affiche un message de succès ou d'erreur et réinitialise le formulaire en cas de succès.
   */
  changePassword(): void {
    if (this.passwordForm.invalid) return;

    const { old_password, new_password, confirm_password } = this.passwordForm.value;

    this.loading = true;
    this.authService.changePassword(old_password, new_password, confirm_password).subscribe({
      next: (res) => {
        this.message = 'Mot de passe modifié avec succès.';
        this.passwordForm.reset();
        this.loading = false;
        setTimeout(() => this.message = '', 3000);
        this.error = '';
      },
      error: (errMsg) => {
        this.error = errMsg;
        this.loading = false;
      }
    });
  }
}