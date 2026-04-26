import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { DashboardIndicadores } from '@shared/models/ordem-servico.model';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/dashboard`;

  getIndicadores(): Observable<DashboardIndicadores> {
    return this.http.get<DashboardIndicadores>(this.base);
  }
}
