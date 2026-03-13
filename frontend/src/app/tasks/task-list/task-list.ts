import { Component, Input, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskService, Task } from '../../services/task';
import { ProjectService } from '../../services/project';
import { AuthService } from '../../services/auth';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './task-list.html',
  styleUrl: './task-list.css',
})

/**
 * Composant pour afficher la liste des tâches d'un projet.
 * - Permet le filtrage par statut, assigné, texte libre et "non assigné".
 * - Autorise la modification ou suppression selon les permissions de l'utilisateur.
 */
export class TaskList implements OnInit {
  @Input() projectId!: number;

  tasks: Task[] = [];
  loading = true;
  error = '';
  currentUserId: number | null = null;
  isProjectCreator = false;

  projectMembers: any[] = []; // pour le filtre assigné
  // Valeurs des filtres
  selectedStatus: string = '';
  selectedAssignee: number | null = null;
  searchText: string = '';
  showUnassigned: boolean = false;

  constructor(
    private taskService: TaskService,
    private projectService: ProjectService,
    private authService: AuthService,
    private cdRef: ChangeDetectorRef
  ) { }

  /**
   * Initialisation :
   * - Récupère l'utilisateur courant
   * - Charge les détails du projet et les tâches
   */
  ngOnInit(): void {
    this.authService.fetchCurrentUser().subscribe({
      next: () => {
        this.currentUserId = this.authService.getCurrentUserId();

        setTimeout(() => {
          this.loadProjectDetails();
          this.loadTasks();
        });
      },
      error: (err) => console.error('Erreur récupération user', err)
    });
  }

  /**
   * Charge les détails du projet (membres et créateur)
   */
  loadProjectDetails(): void {
    this.projectService.getProject(this.projectId).subscribe({
      next: (project) => {
        this.isProjectCreator = project.created_by.id === this.currentUserId;
        this.projectMembers = project.members;
      },
      error: (err) => console.error('Erreur chargement projet', err)
    });
  }

  /**
   * Charge les tâches avec les filtres actifs.
   * - Gestion du filtre "non assigné"
   * - Mise à jour du DOM via ChangeDetectorRef
   */
  loadTasks(): void {
    this.loading = true;

    const filters: any = { project: this.projectId };

    if (this.selectedStatus) {
      filters.status = this.selectedStatus;
    }

    if (this.searchText) {
      filters.search = this.searchText;
    }

    // Gestion du filtre "non assigné"
    if (this.showUnassigned) {
      filters['assigned_to__isnull'] = true;
      console.log(filters);
    }
    else if (this.selectedAssignee) {
      filters.assigned_to = this.selectedAssignee;
    }

    this.taskService.getTasks(filters).subscribe({
      next: (data) => {
        this.tasks = data;
        this.loading = false;
        this.cdRef.detectChanges();
      },
      error: (err) => {
        console.error('Erreur chargement tâches', err);
        this.error = 'Impossible de charger les tâches.';
        this.loading = false;
      }
    });
  }

  /**
   * Applique les filtres sélectionnés et recharge la liste
   */
  applyFilters(): void {
    console.log("filters changed");
    this.loadTasks();
  }

  /**
   * Réinitialise tous les filtres et recharge la liste
   */
  resetFilters(): void {
    this.selectedStatus = '';
    this.selectedAssignee = null;
    this.searchText = '';
    this.showUnassigned = false;

    this.loadTasks();
  }

  /**
   * Vérifie si l'utilisateur peut éditer une tâche
   * - Le créateur du projet ou l'utilisateur assigné peut éditer
   */
  canEdit(task: Task): boolean {
    return this.isProjectCreator || task.assigned_to === this.currentUserId;
  }

  /**
   * Vérifie si l'utilisateur peut supprimer une tâche
   * - Seul le créateur du projet peut supprimer
   */
  canDelete(task: Task): boolean {
    return this.isProjectCreator;
  }

  /**
   * Change le statut d'une tâche
   */
  changeStatus(task: Task, newStatus: string): void {
    if (!this.canEdit(task)) return;

    this.taskService.partialUpdateTask(task.id, { status: newStatus }).subscribe({
      next: (updated) => {
        task.status = updated.status;
        this.cdRef.detectChanges();
      },
      error: (err) => console.error('Erreur mise à jour statut', err)
    });
  }

  /**
   * Supprime une tâche après confirmation
   */
  deleteTask(taskId: number): void {
    if (!confirm('Supprimer cette tâche ?')) return;

    this.taskService.deleteTask(taskId).subscribe({
      next: () => {
        this.tasks = this.tasks.filter(t => t.id !== taskId);
        this.cdRef.detectChanges();
      },
      error: (err) => console.error('Erreur suppression', err)
    });
  }
  
  
}