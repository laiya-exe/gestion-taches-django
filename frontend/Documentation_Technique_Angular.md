# Frontend Angular – Gestion de Tâches Collaboratives

Ce dossier contient l'application frontend développée avec **Angular 21** pour l'application de gestion de tâches collaboratives. Elle communique avec l'API Django via des requêtes HTTP authentifiées par JWT.

---

## Prérequis

- Node.js 18+ et npm
- Angular CLI 21 (installé globalement : `npm install -g @angular/cli`)
- Backend Django lancé sur `http://localhost:8000`

---

## Installation

1. **Cloner le dépôt** et se placer dans le dossier `frontend` :
   ```bash
   git clone https://github.com/laiya-exe/gestion-taches-django.git
   cd frontend
   ```

2. **Installer les dépendances** :
   ```bash
   npm install
   ```

3. **Configurer le proxy** :  
   Le fichier `proxy.conf.json` redirige les appels vers `/api` vers `http://localhost:8000`.  
   Vérifiez qu'il est présent et correct.

4. **Lancer le serveur de développement** :
   ```bash
   ng serve
   ```
   L'application est accessible sur `http://localhost:4200`.

---

## Structure du projet

```
src/
├── app/
│   ├── auth/               # Composants d'authentification (login, register, callback)
│   ├── shared/                # Composants partagés (navbar)
│   ├── dashboard/           # Tableau de bord et statistiques
│   ├── guards/              # Guards de route (authGuard)
│   ├── interceptors/        # Intercepteurs HTTP (authInterceptor)
│   ├── profile/             # Gestion du profil utilisateur
│   ├── projects/            # Composants liés aux projets
│   ├── services/            # Services Angular (Auth, Project, Task, User, Stats)
│   ├── tasks/               # Composants liés aux tâches
│   ├── app.component.*      # Composant racine
│   └── app.routes.ts        # Configuration des routes
├── assets/                  # Images, icônes, etc.
├── index.html
└── main.ts
```

---

##  Composants 

### 1. `Navbar` (`shared/navbar`)
- **Rôle** : Barre de navigation principale affichée sur toutes les pages.
- **Fonctionnalités** :
  - Liens de navigation (Dashboard, Projets, Profil)
  - Affiche le nom de l'utilisateur connecté
  - Bouton de déconnexion
- **Routes** : `/`, `/dashboard`, `/projects`, `/profile`

### 2. `Login` (`auth/login`)
- **Rôle** : Formulaire de connexion.
- **Fonctionnalités** :
  - Champs username / password
  - Appel à `AuthService.login()` pour obtenir un token JWT
  - Redirection vers `/dashboard` après succès
- **Template** : Formulaire Bootstrap avec validation.

### 3. `Register` (`auth/register`)
- **Rôle** : Inscription d'un nouvel utilisateur.
- **Fonctionnalités** :
  - Formulaire avec username, email, password, type (étudiant/professeur)
  - Appel à une API d'inscription (à implémenter côté backend si nécessaire)
  - Redirection vers `/login` après succès

### 4. `Dashboard` (`dashboard/dashboard`)
- **Rôle** : Page d'accueil après connexion.
- **Fonctionnalités** :
  - Affiche les statistiques via `StatsDisplay`
  - Affiche la liste des projets via `ProjectList`

### 5. `StatsDisplay` (`dashboard/stats-display`)
- **Rôle** : Affiche les taux de complétion et les primes.
- **Fonctionnalités** :
  - Appelle `StatsService.getUserStats()`
  - Affiche deux cartes (trimestre et année) avec le taux en couleur
  - Pour les professeurs, affiche le montant de la prime si éligible

### 6. `ProjectList` (`projects/project-list`)
- **Rôle** : Liste tous les projets accessibles par l'utilisateur.
- **Fonctionnalités** :
  - Appelle `ProjectService.getProjects()`
  - Pour chaque projet, affiche le nom, description courte, créateur
  - Boutons "Voir", "Modifier" (si créateur), "Supprimer" (si créateur)
  - Bouton "Nouveau projet" redirigeant vers `/projects/new`

### 7. `ProjectDetail` (`projects/project-detail`)
- **Rôle** : Affiche les détails d'un projet et la liste de ses tâches.
- **Fonctionnalités** :
  - Récupère l'ID depuis l'URL, charge le projet via `ProjectService.getProject()`
  - Affiche le nom, description, créateur, membres
  - Intègre `TaskList` avec `[projectId]="projectId"`
  - Boutons "Modifier" (si créateur) et "Retour"

### 8. `ProjectForm` (`projects/project-form`)
- **Rôle** : Formulaire de création / modification d'un projet.
- **Fonctionnalités** :
  - Mode création (pas d'ID) ou édition (ID dans l'URL)
  - Champs : nom, description, sélection des membres (checkbox)
  - Filtrage des membres selon le type de l'utilisateur :
    - Étudiant : ne voit que les étudiants
    - Professeur : voit tous les utilisateurs
  - Appel à `ProjectService.createProject()` ou `updateProject()`
  - Redirection vers la page de détail après succès

### 9. `TaskList` (`tasks/task-list`)
- **Rôle** : Liste les tâches d'un projet avec filtres.
- **Fonctionnalités** :
  - Reçoit `projectId` en entrée
  - Filtres : recherche textuelle, statut, assigné, non assigné
  - Appelle `TaskService.getTasks()` avec les paramètres de filtre
  - Pour chaque tâche, affiche titre, description, assigné, échéance
  - Sélecteur de statut (accessible à l'assigné ou au créateur)
  - Boutons "Modifier" et "Supprimer" (si créateur)
  - Bouton "Nouvelle tâche" redirigeant vers `/projects/:id/tasks/new`

### 10. `TaskForm` (`tasks/task-form`)
- **Rôle** : Formulaire de création / modification d'une tâche.
- **Fonctionnalités** :
  - Récupère `projectId` et éventuellement `taskId` depuis l'URL
  - Charge la liste des membres du projet pour le select "Assigné à"
  - Champs : titre, description, date limite, assigné, statut (en mode édition)
  - Appel à `TaskService.createTask()` ou `updateTask()`
  - Redirection vers la page de détail du projet après succès

### 11. `Profile` (`profile/profile`)
- **Rôle** : Gestion du profil utilisateur.
- **Fonctionnalités** :
  - Affichage et modification des informations (email, prénom, nom, avatar)
  - Changement de mot de passe avec validation
  - Appels à `AuthService.updateProfile()` et `AuthService.changePassword()`
  - Affichage de l'avatar actuel

---

## Services 

### `AuthService` (`services/auth.service.ts`)
- **Rôle** : Gestion de l'authentification, des tokens et des informations utilisateur.
- **Méthodes principales** :
  - `login(username, password)` : POST `/api/token/`, stocke les tokens
  - `logout()` : supprime les tokens et redirige vers `/login`
  - `getToken()` : retourne le token stocké
  - `isAuthenticated()` : vérifie la présence d'un token
  - `fetchCurrentUser()` : GET `/api/user/`, met à jour `currentUser`
  - `updateProfile(formData)` : PUT `/api/user/`, met à jour le profil
  - `changePassword(oldPassword, newPassword)` : POST `/api/user/change-password/`
  - `getCurrentUserId()`, `getCurrentUserType()` : accesseurs sur `currentUser`

### `ProjectService` (`services/project.service.ts`)
- **Rôle** : Gestion des projets.
- **Méthodes** :
  - `getProjects()` : GET `/api/projects/`
  - `getProject(id)` : GET `/api/projects/{id}/`
  - `createProject(data)` : POST `/api/projects/`
  - `updateProject(id, data)` : PUT `/api/projects/{id}/`
  - `deleteProject(id)` : DELETE `/api/projects/{id}/`

### `TaskService` (`services/task.service.ts`)
- **Rôle** : Gestion des tâches.
- **Méthodes** :
  - `getTasks(projectId?, filters?)` : GET `/api/tasks/` avec paramètres optionnels (status, assigned_to, assigned_to__isnull, search)
  - `getTask(id)` : GET `/api/tasks/{id}/`
  - `createTask(data)` : POST `/api/tasks/`
  - `updateTask(id, data)` : PUT `/api/tasks/{id}/`
  - `partialUpdateTask(id, data)` : PATCH `/api/tasks/{id}/`
  - `deleteTask(id)` : DELETE `/api/tasks/{id}/`

### `UserService` (`services/user.service.ts`)
- **Rôle** : Récupération de la liste des utilisateurs (pour les sélections).
- **Méthodes** :
  - `getUsers()` : GET `/api/users/` (endpoint à créer côté backend)

### `StatsService` (`services/stats.service.ts`)
- **Rôle** : Récupération des statistiques.
- **Méthodes** :
  - `getUserStats()` : GET `/api/stats/`

---

## Intercepteurs et Guards

### `authInterceptor` (`interceptors/auth.interceptor.ts`)
- **Rôle** : Ajoute automatiquement le token JWT dans l'en-tête `Authorization` de chaque requête sortante.
- **Fonctionnement** : intercepte les requêtes HTTP, récupère le token via `AuthService.getToken()` et clone la requête avec l'en-tête si le token existe.

### `authGuard` (`guards/auth.guard.ts`)
- **Rôle** : Protège les routes nécessitant une authentification.
- **Fonctionnement** : retourne `true` si l'utilisateur est authentifié, sinon redirige vers `/login`.

---

##  Styles et UI

- Utilisation de **Bootstrap 5** pour la mise en page de base.
- Classes CSS personnalisées pour certains composants.
- Icônes via **FontAwesome** (inclus dans `index.html`).
- Responsive design pour mobile/tablette.

---
