import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-acceso-denegado',
  standalone: false,
  templateUrl: './acceso-denegado.component.html',
  styleUrl: './acceso-denegado.component.css'
})
export class AccessoDenegadoComponent {
  constructor(private router: Router) {}

  volverAlInicio() {
    this.router.navigate(['/home']);
  }
}
