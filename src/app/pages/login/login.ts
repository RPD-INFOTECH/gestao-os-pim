import { ChangeDetectorRef, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { CommonModule } from '@angular/common';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  email = '';
  password = '';
  loading = false;
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  async onSubmit() {
    if (this.loading) return;

    console.log('[login] submit iniciado');
    this.loading = true;
    this.errorMessage = '';

    try {
      await firstValueFrom(this.authService.login(this.email, this.password));
      console.log('[login] sucesso');
      await this.router.navigate(['/dashboard']);
    } catch (err: any) {
      console.log('[login] erro', err);
      this.errorMessage = err?.error?.message || 'E-mail ou senha inválidos.';
      this.cdr.detectChanges();
    } finally {
      console.log('[login] finalize, loading=false');
      this.loading = false;
      this.cdr.detectChanges();
    }
  }
}
