import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from './shared/navbar/navbar';
import { AuthService } from './services/auth';

@Component({
  selector: 'app-root',
  standalone: true, // needed for imports
  imports: [RouterOutlet, Navbar],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App {
  protected readonly title = signal('frontend');
  constructor(private authService: AuthService) { }

  ngOnInit() {
    if (this.authService.getToken() && !this.authService.currentUser) {
      this.authService.fetchCurrentUser().subscribe({
        next: user => console.log('Utilisateur chargé au démarrage'),
        error: () => this.authService.logout()
      });
    }
  }
}