import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

/**
 * Structure des données d'une tâche.
 */
export interface Task {
  id: number;
  project: number;
  project_name: string;
  title: string;
  description: string;
  due_date: string;
  status: 'a_faire' | 'en_cours' | 'termine';
  assigned_to: number | null;
  assigned_to_detail?: {
    id: number;
    username: string;
    user_type: string;
    avatar?: string;
  };
  created_at: string;
  completed_at: string | null;
}

/**
 * Service pour gérer les tâches (CRUD + filtres).
 */
@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private apiUrl = '/api/tasks/';

  constructor(private http: HttpClient) { }


  /**
   * Récupère la liste des tâches avec filtres optionnels :
   * - project : ID du projet
   * - status : statut de la tâche
   * - assigned_to : ID de l'utilisateur assigné
   * - assigned_to__isnull : true si on cherche les tâches non assignées
   * - search : texte à rechercher dans les tâches
   */
  getTasks(filters?: {
    project?: number;
    status?: string;
    assigned_to?: number;
    assigned_to__isnull?: boolean;
    search?: string;
  }): Observable<Task[]> {

    let params = new HttpParams();

    if (filters) {
      if (filters.project)
        params = params.set('project', filters.project.toString());

      if (filters.status)
        params = params.set('status', filters.status);

      if (filters.assigned_to !== undefined && filters.assigned_to !== null)
        params = params.set('assigned_to', filters.assigned_to.toString());

      if (filters.assigned_to__isnull !== undefined)
        params = params.set('assigned_to__isnull', filters.assigned_to__isnull.toString());

      if (filters.search)
        params = params.set('search', filters.search);
    }

    return this.http.get<Task[]>(this.apiUrl, { params });
  }

  /** Récupère les détails d'une tâche spécifique par son ID */
  getTask(id: number): Observable<Task> {
    return this.http.get<Task>(`${this.apiUrl}${id}/`);
  }

  /** Crée une nouvelle tâche */
  createTask(taskData: any): Observable<Task> {
    return this.http.post<Task>(this.apiUrl, taskData);
  }

  /** Met à jour complètement une tâche existante */
  updateTask(id: number, taskData: any): Observable<Task> {
    return this.http.put<Task>(`${this.apiUrl}${id}/`, taskData);
  }

  /** Met à jour partiellement une tâche (PATCH) */
  partialUpdateTask(id: number, taskData: any): Observable<Task> {
    return this.http.patch<Task>(`${this.apiUrl}${id}/`, taskData);
  }

  /** Supprime une tâche par son ID */
  deleteTask(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}${id}/`);
  }
}