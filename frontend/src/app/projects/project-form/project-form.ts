import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProjectService } from '../../services/project';
import { UserService, User } from '../../services/user';
import { AuthService } from '../../services/auth';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-project-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './project-form.html',
  styleUrl: './project-form.css',
})
export class ProjectForm implements OnInit {

  projectForm!: FormGroup;
  isEditMode = false;
  projectId?: number;
  loading = false;
  error = '';

  allUsers: User[] = [];
  availableUsers: User[] = [];
  currentUserType: string | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private projectService: ProjectService,
    private userService: UserService,
    private authService: AuthService,
    private cdRef: ChangeDetectorRef
  ) { }

  /**
   * Initialisation du composant.
   * - Détermine si le formulaire est en mode création ou édition.
   * - Initialise le formulaire.
   * - Récupère l'utilisateur courant pour déterminer son type.
   * - Charge la liste des utilisateurs et, en mode édition, les données du projet.
   */
  ngOnInit(): void {

    this.projectId = this.route.snapshot.paramMap.get('projectId')
      ? Number(this.route.snapshot.paramMap.get('projectId'))
      : undefined;
    this.isEditMode = !!this.projectId;

    this.initForm();

    this.authService.fetchCurrentUser().subscribe(user => {
      this.currentUserType = user.user_type;
      this.loadUsers();

      if (this.isEditMode) {
        this.loadProject();
      }
    });
  }

  /**
   * Initialise le formulaire réactif pour la création ou modification d'un projet.
   * Définit les champs : nom, description et liste des membres.
   */
  initForm(): void {
    this.projectForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      member_ids: [[]]
    });
  }

  /**
   * Charge la liste de tous les utilisateurs depuis le UserService.
   * - Stocke les utilisateurs dans `allUsers`.
   * - Applique un filtre selon le type d'utilisateur courant.
   * - Force la détection de changement pour rafraîchir l'affichage.
   */
  loadUsers(): void {
    this.userService.getUsers().subscribe({
      next: (users) => {
        this.allUsers = users;
        this.filterAvailableUsers();

        // force Angular à relancer la détection
        this.cdRef.detectChanges();
      },
      error: (err) => {
        console.error('Erreur chargement utilisateurs', err);
        this.error = 'Impossible de charger la liste des utilisateurs.';
      }
    });
  }

  /**
   * Filtre les utilisateurs selon le type de l'utilisateur courant.
   * - Si l'utilisateur est un étudiant, seuls les étudiants peuvent être ajoutés.
   * - Sinon, tous les utilisateurs sont disponibles.
   */
  filterAvailableUsers(): void {
    if (this.currentUserType === 'etudiant') {
      this.availableUsers = this.allUsers.filter(u => u.user_type === 'etudiant');
    } else {
      this.availableUsers = this.allUsers;
    }
  }

  /**
   * Charge les informations d'un projet existant en mode édition.
   * - Remplit le formulaire avec les données du projet.
   * - Convertit la liste des membres en tableau d'IDs.
   */
  loadProject(): void {
    this.loading = true;

    this.projectService.getProject(this.projectId!).subscribe({
      next: (project) => {
        this.projectForm.patchValue({
          name: project.name,
          description: project.description,
          member_ids: project.members.map(m => m.id)
        });

        this.loading = false;
        this.cdRef.detectChanges();
      },
      error: (err) => {
        console.error('Erreur chargement projet', err);
        this.error = 'Impossible de charger le projet.';
        this.loading = false;
      }
    });
  }

  /**
   * Fonction utilisée par Angular pour optimiser le rendu des listes
   * (trackBy dans *ngFor) en identifiant chaque utilisateur par son ID.
   */
  trackUser(index: number, user: User) {
    return user.id;
  }

  /**
   * Gestion de la soumission du formulaire.
   * - Vérifie la validité du formulaire.
   * - En mode édition : met à jour le projet existant.
   * - En mode création : crée un nouveau projet.
   * - Redirige vers la page du projet après succès.
   */
  onSubmit(): void {
    if (this.projectForm.invalid) return;

    this.loading = true;
    const formValue = this.projectForm.value;

    if (this.isEditMode) {
      this.projectService.updateProject(this.projectId!, formValue).subscribe({
        next: () => {
          this.router.navigate(['/projects', this.projectId]);
        },
        error: (err) => {
          console.error('Erreur mise à jour', err);
          this.error = 'Erreur lors de la mise à jour.';
          this.loading = false;
        }
      });
    } else {
      this.projectService.createProject(formValue).subscribe({
        next: (project) => {
          this.router.navigate(['/projects', project.id]);
        },
        error: (err) => {
          console.error('Erreur création', err);
          this.error = 'Erreur lors de la création.';
          this.loading = false;
        }
      });
    }
  }

  /**
   * Gère l'ajout ou la suppression d'un membre dans la liste des membres du projet.
   * Met à jour le tableau `member_ids` du formulaire selon l'état de la checkbox.
   */
  onMemberChange(event: any): void {
    const memberIds = this.projectForm.get('member_ids')?.value as number[];
    const value = +event.target.value;
    if (event.target.checked) {
      memberIds.push(value);
    } else {
      const index = memberIds.indexOf(value);
      if (index > -1) memberIds.splice(index, 1);
    }
    this.projectForm.patchValue({ member_ids: memberIds });
  }

}