import { AuthService, PermissionService } from '@abp/ng.core';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-workspace',
  imports: [CommonModule, RouterModule],
  template: `
    <div class="tf-workspace">
      <aside class="tf-sidebar">
        <a class="tf-brand" routerLink="/">
          <span class="tf-brand-icon"><i class="fas fa-check" aria-hidden="true"></i></span>
          TaskFlow
        </a>
        <nav aria-label="Navegação principal">
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }"
            ariaCurrentWhenActive="page"><i class="fas fa-th-large" aria-hidden="true"></i> Visão geral</a>
          <a *ngIf="auth.isAuthenticated" routerLink="/MinhasTarefas" routerLinkActive="active"
            ariaCurrentWhenActive="page"><i class="fas fa-list-ul" aria-hidden="true"></i> Minhas tarefas</a>
          <a *ngIf="auth.isAuthenticated && permissions.getGrantedPolicy('SettingManagement.Emailing')"
            routerLink="/setting-management"><i class="fas fa-cog" aria-hidden="true"></i> Configurações</a>
        </nav>
      </aside>
      <main class="tf-main"><ng-content></ng-content></main>
    </div>
  `,
  styleUrl: './workspace.component.scss',
})
export class WorkspaceComponent {
  constructor(public readonly auth: AuthService, public readonly permissions: PermissionService) {}
}
