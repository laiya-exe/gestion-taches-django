import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProjectService, Project } from '../../services/project';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-project-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './project-list.html',
  styleUrl: './project-list.css',
})
export class ProjectList implements OnInit {
  projects: Project[] = [];
  loading = true;
  error = '';
  currentUserId: number | null = null;

  constructor(
    private projectService: ProjectService,
    private authService: AuthService,
    private cdRef: ChangeDetectorRef
  ) { }

  /**
   * Initialisation du composant.
   * - Récupère les informations de l'utilisateur courant.
   * - Stocke son ID pour vérifier les droits (créateur du projet).
   * - Lance ensuite le chargement de la liste des projets.
   */
  ngOnInit(): void {
    this.authService.fetchCurrentUser().subscribe({
      next: () => {
        this.currentUserId = this.authService.getCurrentUserId();

        setTimeout(() => {
      this.loadProjects();
    });
      },
      error: (err) => console.error('Erreur récupération user', err)
    });
  }

  /**
   * Charge la liste des projets depuis le ProjectService.
   * - Met à jour le tableau `projects`.
   * - Gère l'état de chargement.
   * - Déclenche la détection de changement pour mettre à jour l'affichage.
   */
  loadProjects(): void {
    this.projectService.getProjects().subscribe({
      next: (data) => {
        this.projects = data;
        this.loading = false;
        this.cdRef.detectChanges();
      },
      error: (err) => {
        console.error('Erreur chargement projets', err);
        this.error = 'Impossible de charger les projets.';
        this.loading = false;
      }
    });
  }

  /**
   * Supprime un projet après confirmation de l'utilisateur.
   * - Appelle le service de suppression.
   * - Met à jour la liste locale des projets en retirant celui supprimé.
   */
  deleteProject(id: number): void {
    if (!confirm('Supprimer ce projet ?')) return;
    this.projectService.deleteProject(id).subscribe({
      next: () => {
        this.projects = this.projects.filter(p => p.id !== id);
      },
      error: (err) => {
        console.error('Erreur suppression', err);
        alert('Erreur lors de la suppression.');
      }
    });
  }

  /**
   * Vérifie si l'utilisateur courant est le créateur d'un projet.
   * Permet de contrôler l'affichage des actions comme la suppression ou l'édition.
   */
  isCreator(project: Project): boolean {
    return project.created_by.id === this.currentUserId;
  }
}