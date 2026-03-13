import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Project, ProjectService } from '../../services/project';
import { TaskList } from '../../tasks/task-list/task-list';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-project-detail',
  standalone: true,
  imports: [CommonModule, TaskList],
  templateUrl: './project-detail.html',
  styleUrl: './project-detail.css',
})
export class ProjectDetail implements OnInit {
  projectId!: number;
  project?: Project;
  error = '';
  currentUserId: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private projectService: ProjectService,
    private authService: AuthService,
    private cdRef: ChangeDetectorRef
  ) { }

  /**
   * Initialisation du composant.
   * - Récupère l'ID de l'utilisateur courant.
   * - Récupère l'ID du projet depuis les paramètres de la route.
   * - Lance le chargement des informations du projet.
   */
  ngOnInit(): void {
    this.currentUserId = this.authService.getCurrentUserId();

    const id = this.route.snapshot.paramMap.get('projectId');
    if (!id) return;

    this.projectId = Number(id);
    // Petit délai pour s'assurer que le composant est prêt avant le chargement
    setTimeout(() => {
      this.loadProject();
    });
  }

  /**
   * Charge les informations détaillées du projet depuis le ProjectService.
   * - Met à jour la propriété `project` avec les données reçues.
   * - Déclenche la détection de changement pour rafraîchir l'affichage.
   * - Gère l'erreur si le projet n'est pas trouvé.
   */
  loadProject(): void {
    this.projectService.getProject(this.projectId).subscribe({
      next: (proj) => {
        this.project = proj;
        this.cdRef.detectChanges();
      },
      error: () => {
        this.error = 'Projet introuvable.';
      }
    });
  }

  /**
   * Vérifie si l'utilisateur courant est le créateur du projet.
   * Permet de contrôler l'affichage de certaines actions (édition, suppression).
   */
  isCreator(): boolean {
    return this.project?.created_by.id === this.currentUserId;
  }
}
