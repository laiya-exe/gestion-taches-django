import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatsService, StatsResponse } from '../../services/stats';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-stats-display',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stats-display.html',
  styleUrl: './stats-display.css',
})
export class StatsDisplay implements OnInit {
  stats: StatsResponse | null = null;
  loading = true;
  error = '';
  userType: string | null = null;

  constructor(
    private statsService: StatsService,
    private authService: AuthService,
    private cdRef: ChangeDetectorRef
  ) { }

  /**
   * Initialisation du composant.
   * - Récupère le type d'utilisateur depuis le service d'authentification.
   * - Lance le chargement des statistiques.
   */
  ngOnInit(): void {
    this.userType = this.authService.getCurrentUserType();
    this.loadStats();
  }

  /**
   * Charge les statistiques de l'utilisateur via le StatsService.
   * - Met à jour la propriété `stats` avec les données reçues.
   * - Gère l'état de chargement et les erreurs.
   * - Force la détection de changement pour mettre à jour l'affichage.
   */
  loadStats(): void {
    this.statsService.getUserStats().subscribe({
      next: (data) => {
        this.stats = data;
        this.loading = false;
        this.cdRef.detectChanges();
      },
      error: (err) => {
        console.error('Erreur chargement stats', err);
        this.error = 'Impossible de charger les statistiques.';
        this.loading = false;
        this.cdRef.detectChanges();
      }
    });
  }

  /**
   * Formate un taux numérique en chaîne de caractères
   * avec une seule décimale.
   * @param rate Taux à formater
   */
  formatRate(rate: number): string {
    return rate.toFixed(1);
  }

  /**
   * Détermine la classe CSS à appliquer selon la valeur du taux.
   * - >= 90 : succès
   * - >= 70 : avertissement
   * - < 70 : danger
   * @param rate Taux à évaluer
   */
  getRateClass(rate: number): string {
    if (rate >= 90) return 'text-success';
    if (rate >= 70) return 'text-warning';
    return 'text-danger';
  }
}