import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
 
@Component({
  selector: 'app-roles-modal',
  standalone: false,
  templateUrl: './roles-modal.component.html',
  styleUrls: ['./roles-modal.component.css']
})
export class RolesModalComponent implements OnInit {
  @Input() rol: any = {};
  @Input() modoVista: boolean = false;
  @Output() guardar = new EventEmitter<any>();
  @Output() cerrar = new EventEmitter<void>();
  
  cargando = false;

  constructor() { }

  ngOnInit(): void {
    // Si el rol está vacío, inicializamos un objeto nuevo
    if (!this.rol) {
      this.rol = {
        nombre: ''
      };
    }
  }

  cerrarModal(): void {
    this.cerrar.emit();
  }

  onSubmit(): void {
    this.cargando = true;
    
    // Emitimos el rol para que el componente padre lo guarde
    this.guardar.emit(this.rol);
    
    // El estado de carga se desactivará cuando el componente padre cierre el modal
    setTimeout(() => {
      this.cargando = false;
    }, 1000);
  }
}