import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

/**
 * Structure des données d'un utilisateur.
 */
export interface User {
  id: number;
  username: string;
  email: string;
  user_type: string;
  avatar?: string;
}

/**
 * Service pour gérer les utilisateurs.
 */
@Injectable({ providedIn: 'root' })
export class UserService {
  private apiUrl = '/api/users/'; // endpoint pour lister les users

  constructor(private http: HttpClient) {}

  /**
   * Récupère la liste de tous les utilisateurs.
   * Retourne un tableau d'objets `User`.
   */
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl);
  }
}