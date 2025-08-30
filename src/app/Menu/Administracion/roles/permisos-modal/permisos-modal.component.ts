import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { RolUsuarioService, Permiso } from '../../../../services/roles.service';
import Swal from 'sweetalert2';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-permisos-modal',
  standalone: false,
  templateUrl: './permisos-modal.component.html',
  styleUrls: ['./permisos-modal.component.css']
})
export class PermisosModalComponent implements OnInit {
  @Input() rolId: number = 0;
  @Input() rolNombre: string = '';
  @Output() cerrar = new EventEmitter<void>();
  @Output() actualizar = new EventEmitter<void>();

  todosLosPermisos: Permiso[] = [];
  permisosAsignados: Permiso[] = [];
  permisosSeleccionados: { [id: number]: boolean } = {};
  permisosAgrupados: { [modulo: string]: Permiso[] } = {};
  modulosExpandidos: { [modulo: string]: boolean } = {};
  
  cargando = false;
  filtroPermiso = '';

  constructor(private rolService: RolUsuarioService) { }

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.cargando = true;

    // Obtener todos los permisos disponibles
    this.rolService.obtenerTodosLosPermisos().subscribe({
        next: (permisos) => {
            this.todosLosPermisos = permisos;
            
            // Agrupar permisos por módulo
            this.agruparPermisosPorModulo();
            
            // Obtener permisos asignados al rol desde la tabla RolPermisos
            this.rolService.obtenerPermisosDeRol(this.rolId).subscribe({
                next: (permisosAsignados) => {
                    this.permisosAsignados = permisosAsignados;

                    // Inicializar el estado de selección
                    this.todosLosPermisos.forEach(permiso => {
                        // Marcar como seleccionado si el permiso está en la lista de permisosAsignados
                        this.permisosSeleccionados[permiso.id] = this.permisosAsignados.some(p => p.id === permiso.id);
                    });

                    // Expandir por defecto los módulos que tienen permisos seleccionados
                    this.inicializarModulosExpandidos();

                    this.cargando = false;
                },
                error: (error) => {
                  console.warn('Este rol aún no cuenta con permisos asignados.');
                  this.permisosAsignados = [];
                  
                  // Inicializar módulos expandidos aún sin permisos
                  this.inicializarModulosExpandidos();
                  
                  this.cargando = false;
                  Swal.fire({
                      icon: 'info',
                      title: 'Sin permisos',
                      text: 'Este rol aún no cuenta con permisos asignados.'
                  });
              }
            });
        },
        error: (error) => {
            console.error('Error al obtener todos los permisos:', error);
            this.cargando = false;
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudieron cargar los permisos disponibles.'
            });
        }
    });
  }

  // Agrupa los permisos por su módulo
  agruparPermisosPorModulo(): void {
    this.permisosAgrupados = {};
    
    this.todosLosPermisos.forEach(permiso => {
      // Extraer el nombre del módulo del nombre del permiso
      const modulo = this.obtenerNombreModulo(permiso.nombre);
      
      if (!this.permisosAgrupados[modulo]) {
        this.permisosAgrupados[modulo] = [];
      }
      
      this.permisosAgrupados[modulo].push(permiso);
    });
  }

  // Obtiene el nombre del módulo a partir del nombre del permiso
  obtenerNombreModulo(nombrePermiso: string): string {
    // Asumiendo formato "Ver Administración", "Crear Administración", etc.
    // Separamos por espacio y tomamos todos menos el primero
    const partes = nombrePermiso.split(' ');
    if (partes.length > 1) {
      return partes.slice(1).join(' ');
    }
    return 'General'; // Si no sigue el patrón esperado
  }

  // Obtiene el nombre corto del permiso (sin el módulo)
  obtenerNombreCortoPermiso(nombrePermiso: string): string {
    // Asumiendo formato "Ver Administración", "Crear Administración", etc.
    // Tomamos solo la primera palabra (acción)
    const partes = nombrePermiso.split(' ');
    if (partes.length > 0) {
      return partes[0];
    }
    return nombrePermiso;
  }

  // Inicializa el estado de expansión de los módulos
  inicializarModulosExpandidos(): void {
    // Inicializar todos los módulos como colapsados
    Object.keys(this.permisosAgrupados).forEach((modulo) => {
      this.modulosExpandidos[modulo] = false;
    });
  }

  // Alterna la expansión de un módulo
  toggleModulo(modulo: string): void {
    this.modulosExpandidos[modulo] = !this.modulosExpandidos[modulo];
  }

  // Filtra los permisos según el texto de búsqueda
  permisosFiltrados(): Permiso[] {
    if (!this.filtroPermiso.trim()) {
      return this.todosLosPermisos;
    }

    const filtro = this.filtroPermiso.toLowerCase();
    return this.todosLosPermisos.filter(permiso => 
      permiso.nombre.toLowerCase().includes(filtro)
    );
  }

  // Filtra los permisos por módulo y por el texto de búsqueda
  filtrarPermisosPorModulo(modulo: string): Permiso[] {
    let permisos = this.permisosAgrupados[modulo] || [];
    
    if (this.filtroPermiso.trim()) {
      const filtro = this.filtroPermiso.toLowerCase();
      return permisos.filter(permiso => 
        permiso.nombre.toLowerCase().includes(filtro)
      );
    }
    
    return permisos;
  }

  // Verifica si todos los permisos de un módulo están seleccionados
  estaTodoElModuloSeleccionado(modulo: string): boolean {
    const permisosDelModulo = this.filtrarPermisosPorModulo(modulo);
    if (permisosDelModulo.length === 0) return false;
    
    return permisosDelModulo.every(permiso => this.permisosSeleccionados[permiso.id]);
  }

  // Verifica si un módulo tiene selección parcial (algunos permisos seleccionados, pero no todos)
  tieneSeleccionParcial(modulo: string): boolean {
    const permisosDelModulo = this.filtrarPermisosPorModulo(modulo);
    if (permisosDelModulo.length === 0) return false;
    
    const algunoSeleccionado = permisosDelModulo.some(permiso => this.permisosSeleccionados[permiso.id]);
    const todosSeleccionados = permisosDelModulo.every(permiso => this.permisosSeleccionados[permiso.id]);
    
    return algunoSeleccionado && !todosSeleccionados;
  }

  // Alterna la selección de todos los permisos de un módulo
  toggleSeleccionModulo(modulo: string, event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    const seleccionar = checkbox.checked;
    
    this.filtrarPermisosPorModulo(modulo).forEach(permiso => {
      this.permisosSeleccionados[permiso.id] = seleccionar;
    });
  }

  // Alterna la selección de todos los permisos visibles (con el filtro aplicado)
  toggleSeleccionTodos(seleccionar: boolean): void {
    this.permisosFiltrados().forEach(permiso => {
      this.permisosSeleccionados[permiso.id] = seleccionar;
    });
  }

  // Cuenta el total de permisos seleccionados
  contarSeleccionados(): number {
    return Object.values(this.permisosSeleccionados).filter(selected => selected).length;
  }

  cerrarModal(): void {
    this.cerrar.emit();
  }

  guardarPermisos(): void {
  this.cargando = true;

  // Obtener los IDs de todos los permisos seleccionados
  const permisosIdsSeleccionados = Object.keys(this.permisosSeleccionados)
    .filter(id => this.permisosSeleccionados[Number(id)])
    .map(id => Number(id));

  if (permisosIdsSeleccionados.length === 0) {
    Swal.fire({
      icon: 'info',
      title: 'Sin permisos seleccionados',
      text: 'Debes seleccionar al menos un permiso para asignar al rol.'
    });
    this.cargando = false;
    return;
  }

  // Enviar la lista completa al backend para reemplazar los permisos actuales
  this.rolService.actualizarPermisosDeRol(this.rolId, permisosIdsSeleccionados)
    .subscribe({
      next: () => {
        this.cargando = false;
        Swal.fire({
          icon: 'success',
          title: 'Permisos actualizados',
          text: 'Los permisos del rol se actualizaron correctamente.'
        });
        this.actualizar.emit();
        this.cerrarModal();
      },
      error: (error) => {
        this.cargando = false;
        console.error('Error al actualizar permisos:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Hubo un problema al actualizar los permisos.'
        });
      }
    });
}

}