import { Routes } from '@angular/router';
import { authGuard } from './guards/auth-guard';
import { LoginComponent } from './paginas/login/login';
import { DashboardComponent } from './paginas/dashboard/dashboard';
import { WorkflowsComponent } from './paginas/workflows/workflows';
import { BandejaTareasComponent } from './paginas/bandeja-tareas/bandeja-tareas';
import { MonitorProcesosComponent } from './paginas/monitor-procesos/monitor-procesos';
import { EditorWorkflowsComponent } from './paginas/editor-workflows/editor-workflows';
import { roleGuard } from './guards/role.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },

  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard]
  },
  {
    path: 'workflows',
    component: WorkflowsComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['Admin', 'Diseñador'] }
  },
  {
  path: 'editor-workflows',
  component: EditorWorkflowsComponent,
  canActivate: [authGuard, roleGuard],
  data: { roles: ['Admin', 'Diseñador'] }
  },
  {
    path: 'bandeja-tareas',
    component: BandejaTareasComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['Admin', 'Usuario'] }
  },
  {
    path: 'monitor-procesos',
    component: MonitorProcesosComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['Admin', 'Diseñador'] }
  },

  { path: '**', redirectTo: 'login' }
];