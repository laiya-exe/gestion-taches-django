import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

/**
 * Structure des données retournées par l'API des statistiques.
 */
export interface StatsResponse {
  quarter: {
    rate: number;   // taux de réussite sur le trimestre
    prime?: number; // prime éventuelle pour les professeurs
  };
  year: {
    rate: number;   // taux de réussite annuel
    prime?: number; // prime éventuelle pour les professeurs
  };
}

@Injectable({
  providedIn: 'root'
})
/**
 * Service chargé de récupérer les statistiques
 * de l'utilisateur depuis l'API.
 */
export class StatsService {
  private apiUrl = '/api/stats/';

  constructor(private http: HttpClient) { }

  /**
   * Récupère les statistiques de l'utilisateur connecté.
   * Les données incluent :
   * - le taux trimestriel
   * - le taux annuel
   * - éventuellement une prime si l'utilisateur est professeur.
   */
  getUserStats(): Observable<StatsResponse> {
    return this.http.get<StatsResponse>(this.apiUrl);
  }
}