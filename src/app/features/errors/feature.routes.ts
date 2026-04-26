import { Routes } from '@angular/router';
import { Forbidden } from './pages/forbidden/forbidden';
import { NotFound } from './pages/not-found/not-found';

export const ERROR_ROUTES: Routes = [
  { path: '403', component: Forbidden },
  { path: '404', component: NotFound },
];
