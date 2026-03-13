import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Project {
  id: number;
  name: string;
  description: string;
  created_by: {
    id: number;
    username: string;
    email: string;
    user_type: string;
    avatar?: string;
  };
  created_at: string;
  members: {
    id: number;
    username: string;
    email: string;
    user_type: string;
    avatar?: string;
  }[];
}

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private apiUrl = '/api/projects/';  // via le proxy

  constructor(private http: HttpClient) {}

  /**
   * Récupère la liste de tous les projets depuis l'API.
   * Retourne un tableau d'objets `Project`.
   */
  getProjects(): Observable<Project[]> {
    return this.http.get<Project[]>(this.apiUrl);
  }

  /**
   * Récupère les détails d'un projet spécifique
   * en utilisant son identifiant.
   * @param id Identifiant du projet
   */
  getProject(id: number): Observable<Project> {
    return this.http.get<Project>(`${this.apiUrl}${id}/`);
  }

  /**
   * Crée un nouveau projet.
   * @param projectData Données du projet à créer (nom, description, membres, etc.)
   */
  createProject(projectData: any): Observable<Project> {
    return this.http.post<Project>(this.apiUrl, projectData);
  }

  /**
   * Met à jour un projet existant.
   * @param id Identifiant du projet à modifier
   * @param projectData Nouvelles données du projet
   */
  updateProject(id: number, projectData: any): Observable<Project> {
    return this.http.put<Project>(`${this.apiUrl}${id}/`, projectData);
  }

  /**
   * Supprime un projet.
   * @param id Identifiant du projet à supprimer
   */
  deleteProject(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}${id}/`);
  }
}