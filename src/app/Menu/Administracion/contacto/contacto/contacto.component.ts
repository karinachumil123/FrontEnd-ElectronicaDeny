import { Component, OnInit } from '@angular/core';
import { EmpresaService, Empresa } from '../../../../services/empresa.service';
import { AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'app-contacto',
  standalone: false,
  templateUrl: './contacto.component.html',
  styleUrl: './contacto.component.css'
})

export class ContactoComponent implements OnInit {
  isModalOpen = false;
  empresa: Empresa = {
    nombre: '',
    telefono: '',
    correo: '',
    direccion: ''
  };

   //Variables de Permisos
  puedeCrear: boolean = false;
  puedeEditar: boolean = false;
  puedeEliminar: boolean = false;
  puedeVer: boolean = false;

  constructor(private empresaService: EmpresaService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.obtenerEmpresa();
    this.cargarPermisos();
  }

  obtenerEmpresa() {
    this.empresaService.obtenerEmpresa().subscribe(
      (response) => {
        this.empresa = response;
      },
      (error) => {
        console.error('Error al obtener la empresa:', error);
      }
    );
  }

  cargarPermisos() {
    const permisos = this.authService.obtenerPermisos(); // o donde guardes los permisos del usuario
  
    this.puedeCrear = permisos.includes('Crear Contacto');
    this.puedeEditar = permisos.includes('Editar Contacto');
    this.puedeEliminar = permisos.includes('Eliminar Contacto');
    this.puedeVer = permisos.includes('Ver Contacto');
  }

  openModal() {
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }

  actualizarEmpresa(empresa: Empresa) {
    this.empresa = empresa; // Actualiza la información en la vista
  }
}
