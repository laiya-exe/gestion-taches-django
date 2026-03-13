# Application de Gestion de Tâches

Application web complète pour gérer des projets et des tâches en équipe, avec un système de primes pour les enseignants basé sur le taux de complétion dans les délais.  
Développée avec **Django REST Framework** (backend) et **Angular** (frontend).

---

## Fonctionnalités

- Authentification JWT (inscription, connexion, gestion de profil)
- Deux profils : **Étudiant** et **Professeur**
- Création et gestion de projets
- Gestion des tâches (CRUD, assignation, statuts)
- Règles de permissions :
  - Seul le créateur d'un projet peut ajouter/supprimer des tâches et des membres
  - L'utilisateur assigné peut modifier le statut de sa tâche
  - Un étudiant ne peut assigner que des étudiants à un projet
- Tableau de bord avec statistiques de complétion (trimestre/année)
- Calcul automatique des primes pour les professeurs (≥90% → 30k, 100% → 100k)
- Filtres avancés sur les tâches (par statut, assigné, non assigné, recherche)
- Interface utilisateur responsive avec Bootstrap

---

## Technologies utilisées

### Backend
- Python 3.10+
- Django 4.2
- Django REST Framework
- SimpleJWT (authentification par token)
- Django CORS Headers
- Django Filter
- SQLite 

### Frontend
- Angular 21 
- Bootstrap 5
- FontAwesome
- RxJS

---

## Installation et configuration

### Prérequis
- Python 3.10 ou supérieur
- Node.js 18+ et npm
- Git

#### Les installations et configurations du backend sont disponibles sur ```https://github.com/laiya-exe/gestion-taches-django/blob/main/public/Documentation Technique - Django.md```

#### Les installations et configurations du frontend sont disponibles sur ```https://github.com/laiya-exe/gestion-taches-django/blob/main/public/Documentation Technique - Angular.md```

---

## Notes complémentaires

- Le projet utilise SQLite pour le développement. 
- Les fichiers médias (avatars) sont servis via django.conf.urls.static.
- L'application Angular utilise un proxy en développement pour éviter les CORS (configuration dans proxy.conf.json).

---

## Note au professeur

Vous remarquerez peut-etre que certaines vues et urls ont été implémentéés, mais ne sont pas vraiment utilisées dans l'application. J'avais d'abord utilisé ces vues pour des templates django qui devaient servir à la gestion des utilisateurs (login, register, etc) comme le dit ```Objectifs 1 (en utilisant les Template Django)``` dans le cahier des charges. Mais vous nous avez informé que tout devait se faire avec un framework front, sans templates donc.
Ces vues et urls inutilisés sont celles que je n'ai pas eu le temps de nettoyer avant de rendre le produit final.
Merci de votre compréhension.