import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth-guard';
import { Login } from './auth/login/login';
import { Register } from './auth/register/register';
import { Profile } from './auth/profile/profile';
import { Dashboard } from './dashboard/dashboard/dashboard';

import { AuthCallback } from './auth/callback/callback';
import { ProjectList } from './projects/project-list/project-list';
import { ProjectDetail } from './projects/project-detail/project-detail';
import { ProjectForm } from './projects/project-form/project-form';
import { TaskFormComponent } from './tasks/task-form/task-form';

export const routes: Routes = [
  { path: 'auth/login', component: Login },
  { path: 'auth/register', component: Register },
  { path: 'auth/callback', component: AuthCallback },
  { path: 'profile', component: Profile, canActivate: [AuthGuard] },
  { path: 'dashboard', component: Dashboard, canActivate: [AuthGuard] },

  {
    path: 'projects',
    canActivate: [AuthGuard],
    children: [
      { path: '', component: ProjectList },
      { path: 'new', component: ProjectForm },
      {
        path: ':projectId',
        children: [
          { path: '', component: ProjectDetail },
          { path: 'edit', component: ProjectForm },
          { path: 'tasks/new', component: TaskFormComponent },
          { path: 'tasks/:taskId/edit', component: TaskFormComponent }
        ]
      }
    ]
  },

  // Redirections par défaut
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: '**', redirectTo: '/dashboard' }
];