import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { Perfil } from '../../core/models/perfil.enum';

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
export class Navbar {
  private auth = inject(AuthService);

  user = this.auth.currentUser;
  perfil = this.auth.currentPerfil;

  private allItems: MenuItem[] = [
    { label: 'Dashboard', icon: 'dashboard', link: '/dashboard' },
    { label: 'Ordens de Serviço', icon: 'precision_manufacturing', link: '/ordens-de-servico' },
    { label: 'Equipamentos', icon: 'inventory_2', link: '/equipamentos' },
    { label: 'Usuários', icon: 'group', link: '/usuarios', roles: [Perfil.SUPERVISOR] },
    { label: 'Histórico', icon: 'history', link: '/historico', roles: [Perfil.SUPERVISOR, Perfil.TECNICO] },
    { label: 'Relatórios', icon: 'analytics', link: '/relatorios', roles: [Perfil.SUPERVISOR] },
  ];

  menu = computed<MenuItem[]>(() => {
    const current = this.perfil();
    return this.allItems.filter((item) => !item.roles || (current !== null && item.roles.includes(current)));
  });

  logout(): void {
    this.auth.logout();
  }
}
