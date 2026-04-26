import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { Navbar } from '@shared/components/navbar/navbar';

@Component({
  selector: 'app-main-layout',
  imports: [CommonModule, RouterOutlet, Navbar],
  templateUrl: './main-layout.html',
})
export class MainLayout {}
