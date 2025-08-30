import { Component, Input, Output, EventEmitter } from '@angular/core';
import { EmpresaService, Empresa } from '../../../../services/empresa.service';

@Component({
  selector: 'app-contacto-modal',
  standalone: false,
  templateUrl: './contacto-modal.component.html',
  styleUrl: './contacto-modal.component.css'
})

export class ContactoModalComponent {
  @Input() empresa: Empresa = {
    nombre: '',
    telefono: '',
    correo: '',
    direccion: ''
  };
  @Output() close = new EventEmitter<void>();
  @Output() guardar = new EventEmitter<Empresa>();

  constructor(private empresaService: EmpresaService) { }

  closeModal() {
    this.close.emit();
  }

  onSubmit() {
    this.empresaService.actualizarEmpresa(this.empresa).subscribe(
      (response) => {
        console.log('Empresa actualizada:', response);
        this.guardar.emit(response); // Emitir la empresa actualizada
        this.closeModal();
      },
      (error) => {
        console.error('Error al actualizar la empresa:', error);
      }
    );
  }
}
