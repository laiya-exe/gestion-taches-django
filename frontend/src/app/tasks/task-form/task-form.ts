import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TaskService } from '../../services/task';
import { ProjectService } from '../../services/project';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './task-form.html',
  styleUrl: './task-form.css',
})

/**
 * Composant pour créer ou éditer une tâche dans un projet.
 * - Charge les membres du projet pour l'assignation.
 * - Gère la création ou la mise à jour d'une tâche via TaskService.
 * - Redirige vers la page du projet après succès.
 */
export class TaskFormComponent implements OnInit {
  projectId!: number;
  taskId?: number;
  isEditMode = false;

  task = {
    title: '',
    description: '',
    due_date: '',
    status: 'a_faire',
    assigned_to: null as number | null
  };

  projectMembers: any[] = [];
  loading = false;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private taskService: TaskService,
    private projectService: ProjectService,
    private authService: AuthService,
    private cdRef: ChangeDetectorRef

  ) { }

  /**
   * Initialisation du composant :
   * - Récupère l'ID du projet et éventuellement de la tâche
   * - Charge les membres du projet
   * - Charge les données de la tâche si mode édition
   */
  ngOnInit(): void {
    this.projectId = Number(this.route.snapshot.paramMap.get('projectId'));
    this.taskId = this.route.snapshot.paramMap.get('taskId')
      ? Number(this.route.snapshot.paramMap.get('taskId'))
      : undefined;
    this.isEditMode = !!this.taskId;

    this.loadProjectMembers();
    if (this.isEditMode) {
      this.loadTask();
    }
  }

  /**
   * Charge la liste des membres du projet depuis ProjectService.
   * Met à jour le DOM immédiatement via ChangeDetectorRef.
   */
  loadProjectMembers(): void {
    this.projectService.getProject(this.projectId).subscribe({
      next: (project) => {
        this.projectMembers = project.members;

        // force Angular à mettre à jour le DOM immédiatement
        this.cdRef.detectChanges();
      },
      error: (err) => {
        console.error('Erreur chargement membres', err);
        this.error = 'Impossible de charger les membres du projet.';
      }
    });
  }

  /**
   * Charge les informations d'une tâche existante pour pré-remplir le formulaire.
   */
  loadTask(): void {
    this.loading = true;
    this.taskService.getTask(this.taskId!).subscribe({
      next: (task) => {
        this.task = {
          title: task.title,
          description: task.description,
          due_date: task.due_date,
          status: task.status,
          assigned_to: task.assigned_to
        };
        this.loading = false;
        this.cdRef.detectChanges(); // <--- force l’update
      },
      error: (err) => {
        console.error('Erreur chargement tâche', err);
        this.error = 'Impossible de charger la tâche.';
        this.loading = false;
        this.cdRef.detectChanges();
      }
    });
  }

  /**
   * Soumission du formulaire :
   * - Si mode édition → met à jour la tâche
   * - Si création → crée une nouvelle tâche
   * - Redirige vers la page du projet après succès
   */
  onSubmit(): void {
    this.loading = true;
    const taskData = {
      ...this.task,
      project: this.projectId
    };

    if (this.isEditMode) {
      this.taskService.updateTask(this.taskId!, taskData).subscribe({
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
      this.taskService.createTask(taskData).subscribe({
        next: () => {
          this.router.navigate(['/projects', this.projectId]);
        },
        error: (err) => {
          console.error('Erreur création', err);
          this.error = 'Erreur lors de la création.';
          this.loading = false;
        }
      });
    }
  }
}