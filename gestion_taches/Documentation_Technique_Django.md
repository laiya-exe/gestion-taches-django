# Backend Django – Gestion de Tâches Collaboratives

Ce dossier contient le backend de l'application, développé avec **Django** et **Django REST Framework**. Il expose une API RESTful sécurisée par JWT, gère l'authentification, les projets, les tâches, les statistiques et les primes.

---

## Technologies utilisées

- Python 3.10+
- Django 4.2
- Django REST Framework 3.14
- SimpleJWT (authentification par token)
- Django CORS Headers
- Django Filter
- SQLite (développement)

---

## Installation et configuration

### Prérequis
- Python 3.10 ou supérieur
- Git

#### 1. Cloner le dépôt
```bash
git clone https://github.com/laiya-exe/gestion-taches-django.git
cd gestion-taches
```

#### 2. Configuration du backend
```bash
# Aller dans le dossier gestion_taches
cd gestion_taches

# Créer un environnement virtuel
python -m venv venv
.\venv\Scripts\activate

# Installer les dépendances
pip install -r requirements.txt

# Appliquer les migrations
python manage.py makemigrations users projects tasks
python manage.py migrate

# Créer un superutilisateur
python manage.py createsuperuser

# Lancer le serveur de développement
python manage.py runserver
```
Le backend est accessible à l'adresse ``` http://localhost:8000 ```.
L'interface d'administration Django est sur ``` http://localhost:8000/admin ```.

---

## Structure du projet

```
gestion_taches/
├── gestion_taches/          # Configuration principale (settings, urls, api_urls)
├── users/                    # Gestion des utilisateurs
│   ├── models.py             # Modèle User personnalisé
│   ├── serializers.py        # Sérializer User
│   ├── api_views.py              # Vues pour l'API (current user, change password)
│   ├── utils.py              # Calculs des statistiques et primes
│   └── tests/                # Tests unitaires
├── projects/                 # Gestion des projets
│   ├── models.py
│   ├── serializers.py
│   ├── permissions.py        # Permissions personnalisées (IsProjectCreatorOrReadOnly)
│   ├── api_views.py              # ViewSet pour les projets
│   └── tests/
├── tasks/                     # Gestion des tâches
│   ├── models.py
│   ├── serializers.py
│   ├── filters.py             # Filtres personnalisés (assigned_to__isnull)
│   └── api_views.py               # ViewSet pour les tâches
├── manage.py
├── pytest.ini
└── requirements.txt
```

---

## Modèles de données

### `User` (dans `users/models.py`)
- Hérite d'`AbstractUser`
- `user_type` : CharField avec choix `('etudiant', 'Étudiant')` et `('professeur', 'Professeur')`
- `avatar` : ImageField (optionnel)
- Méthodes : `__str__` retourne `username (type)`

### `Project` (dans `projects/models.py`)
- `name` : CharField(max_length=200)
- `description` : TextField(blank=True)
- `created_by` : ForeignKey vers User (related_name='projects_created')
- `created_at` : DateTimeField(auto_now_add=True)
- `members` : ManyToManyField vers User (related_name='projects_participating', blank=True)
- `__str__` : retourne le nom du projet

### `Task` (dans `tasks/models.py`)
- `project` : ForeignKey vers Project (related_name='tasks', on_delete=CASCADE)
- `title` : CharField(max_length=200)
- `description` : TextField(blank=True)
- `due_date` : DateField
- `status` : CharField(choices=[('a_faire', 'À faire'), ('en_cours', 'En cours'), ('termine', 'Terminé')], default='a_faire')
- `assigned_to` : ForeignKey vers User (null=True, blank=True, on_delete=SET_NULL, related_name='tasks_assigned')
- `created_at` : DateTimeField(auto_now_add=True)
- `completed_at` : DateTimeField(null=True, blank=True)
- Méthode `completed_on_time()` : retourne True si la tâche est terminée et que `completed_at <= due_date`

---

## Authentification et permissions

### Authentification
- Utilisation de **SimpleJWT** pour l'authentification par token.
- Endpoints :
  - `POST /api/token/` : obtention d'un token (access + refresh)
  - `POST /api/token/refresh/` : rafraîchissement du token

### Permissions globales (dans `settings.py`)
```python
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    )
}
```

### Permissions personnalisées
- **`IsProjectCreatorOrReadOnly`** (`projects/permissions.py`) : autorise la modification/suppression d'un projet uniquement à son créateur.
- Dans `TaskViewSet`, les vérifications sont faites manuellement dans `perform_create`, `perform_update`, `perform_destroy` pour respecter les règles :
  - Seul le créateur du projet peut créer, modifier ou supprimer une tâche.
  - L'utilisateur assigné peut modifier le statut de sa tâche (via PATCH).
  - Un étudiant ne peut assigner une tâche qu'à d'autres étudiants (vérification côté frontend, mais peut être renforcée côté backend).

---

## API Endpoints

Tous les endpoints sont préfixés par `/api/`.

### Utilisateurs
| Méthode | URL | Description |
|--------|-----|-------------|
| `GET` | `/api/user/` | Informations de l'utilisateur connecté |
| `PUT` | `/api/user/` | Mise à jour du profil (email, prénom, nom, avatar) |
| `POST` | `/api/user/change-password/` | Changement de mot de passe |
| `GET` | `/api/users/` | Liste de tous les utilisateurs (pour les sélections) |

### Projets
| Méthode | URL | Description |
|--------|-----|-------------|
| `GET` | `/api/projects/` | Liste des projets accessibles (créés + participations) |
| `POST` | `/api/projects/` | Création d'un projet |
| `GET` | `/api/projects/{id}/` | Détail d'un projet |
| `PUT` | `/api/projects/{id}/` | Modification (réservée au créateur) |
| `DELETE` | `/api/projects/{id}/` | Suppression (réservée au créateur) |

### Tâches
| Méthode | URL | Description |
|--------|-----|-------------|
| `GET` | `/api/tasks/` | Liste des tâches (filtrable par `project`, `status`, `assigned_to`, `assigned_to__isnull`, `search`) |
| `POST` | `/api/tasks/` | Création d'une tâche (réservée au créateur du projet) |
| `GET` | `/api/tasks/{id}/` | Détail d'une tâche |
| `PUT` | `/api/tasks/{id}/` | Modification complète (réservée au créateur du projet) |
| `PATCH` | `/api/tasks/{id}/` | Modification partielle (accessible à l'assigné pour le statut) |
| `DELETE` | `/api/tasks/{id}/` | Suppression (réservée au créateur du projet) |

### Statistiques
| Méthode | URL | Description |
|--------|-----|-------------|
| `GET` | `/api/stats/` | Taux de complétion du trimestre et de l'année, primes éligibles (pour les professeurs) |

---

## Calcul des statistiques et primes

Les fonctions se trouvent dans `users/utils.py`.

- **`calculate_completion_rate(user, start_date, end_date)`** :
  - Compte le nombre de tâches assignées à `user` dans l'intervalle.
  - Parmi elles, compte celles qui sont terminées et dont `completed_at <= due_date`.
  - Retourne le pourcentage (float).

- **`get_prime_eligibility(user)`** :
  - Utilisée uniquement pour les professeurs.
  - Calcule les taux pour le trimestre en cours (90 derniers jours) et l'année en cours.
  - Détermine le montant de la prime :
    - 30 000 F si taux ≥ 90% et < 100%
    - 100 000 F si taux = 100%
  - Retourne un dictionnaire contenant les taux et les primes.

---

## Filtres avancés

Dans `tasks/filters.py`, un filtre personnalisé `TaskFilter` est défini pour permettre le filtrage par `assigned_to__isnull` (tâches non assignées) :

```python
class TaskFilter(FilterSet):
    assigned_to__isnull = filters.BooleanFilter(field_name='assigned_to', lookup_expr='isnull')
    class Meta:
        model = Task
        fields = ['project', 'status', 'assigned_to', 'assigned_to__isnull']
```

Ce filtre est utilisé dans `TaskViewSet` via `filterset_class`.

---
