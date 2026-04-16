import { Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { Perfil } from '../../core/models/perfil.enum';
import { environment } from '../../../environments/environment';

interface MenuItem {
  label: string;
  icon: string;
  link: string;
  roles?: Perfil[];
}

@Component({
  selector: 'app-navbar',
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
})
export class Navbar implements OnInit, OnDestroy {
  private auth = inject(AuthService);
  private timerId: ReturnType<typeof setInterval> | null = null;

  user = this.auth.currentUser;
  perfil = this.auth.currentPerfil;
  now = signal(new Date());
  sidebarOpen = signal(false);
  environmentLabel = environment.production ? 'Produção' : 'Local';

  private allItems: MenuItem[] = [
    { label: 'Dashboard', icon: 'dashboard', link: '/dashboard' },
    { label: 'Ordens de Serviço', icon: 'precision_manufacturing', link: '/ordens-de-servico' },
    { label: 'Equipamentos', icon: 'inventory_2', link: '/equipamentos', roles: [Perfil.TECNICO, Perfil.SUPERVISOR] },
    { label: 'Usuários', icon: 'group', link: '/usuarios', roles: [Perfil.SUPERVISOR] },
    { label: 'Histórico', icon: 'history', link: '/historico', roles: [Perfil.SUPERVISOR, Perfil.TECNICO] },
    { label: 'Relatórios', icon: 'analytics', link: '/relatorios', roles: [Perfil.SUPERVISOR] },
  ];

  menu = computed<MenuItem[]>(() => {
    const current = this.perfil();
    return this.allItems.filter((item) => !item.roles || (current !== null && item.roles.includes(current)));
  });

  saudacao = computed(() => {
    const hour = this.now().getHours();

    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  });

  perfilLabel = computed(() => {
    switch (this.perfil()) {
      case Perfil.SUPERVISOR:
        return 'Supervisor';
      case Perfil.TECNICO:
        return 'Técnico';
      case Perfil.SOLICITANTE:
        return 'Solicitante';
      default:
        return '';
    }
  });

  initials = computed(() => {
    const name = this.user()?.nome?.trim();
    if (!name) return '?';

    const parts = name.split(/\s+/).slice(0, 2);
    return parts.map((part) => part.charAt(0).toUpperCase()).join('');
  });

  ngOnInit(): void {
    this.timerId = setInterval(() => {
      this.now.set(new Date());
    }, 1000);
  }

  ngOnDestroy(): void {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  toggleSidebar(): void {
    this.sidebarOpen.update((value) => !value);
  }

  closeSidebar(): void {
    this.sidebarOpen.set(false);
  }

  logout(): void {
    this.closeSidebar();
    this.auth.logout();
  }
}
