import { Component, OnInit, ViewChild } from '@angular/core';
import { UsuarioService } from '../../../../services/usuario.service';
import Swal from 'sweetalert2';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UsuarioModalComponent } from '../usuarios-modal/usuarios-modal.component';
import { AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.css'],
  imports: [FormsModule, CommonModule, UsuarioModalComponent]
})
export class UsuariosComponent implements OnInit {
  usuarios: any[] = [];
  mostrarModal = false;
  usuarioSeleccionado: any = null;
  modoVista: boolean = false;
  @ViewChild(UsuarioModalComponent) usuarioModalComponent!: UsuarioModalComponent;

  // Variables de Permisos
  puedeCrear: boolean = false;
  puedeEditar: boolean = false;
  puedeEliminar: boolean = false;
  puedeVer: boolean = false;

  // Filtros
  filtroUsuario = '';
  filtroEstado: 'todos' | 'activos' | 'inactivos' = 'todos';
  fechaInicio: string = '';
  fechaFin: string = '';

  // Paginación
  paginaActual = 1;
  elementosPorPagina = 10;

  // Datos originales para restaurar después de filtrar
  originalUsuarios: any[] = [];

  constructor(
    private usuarioService: UsuarioService, 
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.cargarUsuarios();
    this.verificarPropiedadesUsuarios();
    this.cargarPermisos();
  }

  limpiarFiltros() {
    this.filtroUsuario = '';
    this.filtroEstado = 'todos';
    this.fechaInicio = '';
    this.fechaFin = '';
    this.usuarios = [...this.originalUsuarios]; // Restaurar todos los usuarios
    this.paginaActual = 1;
  }

  cargarUsuarios() {
    this.usuarioService.obtenerUsuarios().subscribe({
      next: (data) => {
        console.log('Datos de usuarios recibidos:', data);
        this.originalUsuarios = data;
        this.usuarios = [...data];
        this.verificarPropiedadesUsuarios();
      },
      error: (error) => {
        Swal.fire({
          icon: 'error',
          title: 'Error al cargar usuarios',
          text: error.message || 'Hubo un problema al cargar los usuarios.'
        });
      }
    });
  }

  verificarPropiedadesUsuarios() {
    if (this.usuarios.length > 0) {
      console.log('Estructura de Usuarios:', Object.keys(this.usuarios[0]));
      console.log('Primer Usuario:', this.usuarios[0]);
    }
  }

  cargarPermisos() {
    const usuario = this.authService.currentUserValue; // Usuario autenticado
    const permisos = this.authService.obtenerPermisos(); 

    if (usuario?.role === 'Admin') { // Si el rol es Admin
      // Administrador tiene todos los permisos
      this.puedeCrear = true;
      this.puedeEditar = true;
      this.puedeEliminar = true;
      this.puedeVer = true;
    } else {
      // Usuario normal según permisos asignados
      this.puedeCrear = permisos.includes('Crear Usuarios');
      this.puedeEditar = permisos.includes('Editar Usuarios');
      this.puedeEliminar = permisos.includes('Eliminar Usuarios');
      this.puedeVer = permisos.includes('Ver Usuarios');
    }
  }

  buscarUsuario() {
    const filtroTexto = this.filtroUsuario.toLowerCase().trim();
    const estadoSeleccionado = this.filtroEstado.toLowerCase();

    this.usuarios = this.originalUsuarios.filter(usuario => {
      // Filtro por texto (nombre, apellido o correo)
      const coincideTexto =
        usuario.nombre?.toLowerCase().includes(filtroTexto) ||
        usuario.apellido?.toLowerCase().includes(filtroTexto) ||
        usuario.correo?.toLowerCase().includes(filtroTexto);

      // Filtro por estado
      const coincideEstado =
        estadoSeleccionado === 'todos' ||
        (estadoSeleccionado === 'activos' && usuario.estado === 'Activo') ||
        (estadoSeleccionado === 'inactivos' && usuario.estado === 'Inactivo');

      return coincideTexto && coincideEstado;
    });

    this.paginaActual = 1;
  }

  filtrarPorFecha() {
    if (!this.fechaInicio || !this.fechaFin) {
      Swal.fire({
        icon: 'warning',
        title: 'Fechas incompletas',
        text: 'Por favor seleccione ambas fechas.'
      });
      return;
    }

    const inicio = new Date(this.fechaInicio);
    const fin = new Date(this.fechaFin);

    if (isNaN(inicio.getTime()) || isNaN(fin.getTime())) {
      Swal.fire({
        icon: 'warning',
        title: 'Fechas inválidas',
        text: 'Por favor ingrese fechas válidas.'
      });
      return;
    }

    this.usuarios = this.originalUsuarios.filter(usuario => {
      const fechaCreacion = new Date(usuario.fechaCreacion);
      return fechaCreacion >= inicio && fechaCreacion <= fin;
    });

    this.paginaActual = 1;
  }

  usuariosPaginados(): any[] {
    return this.usuarios.slice(
      (this.paginaActual - 1) * this.elementosPorPagina,
      this.paginaActual * this.elementosPorPagina
    );
  }

  totalPaginas(): number {
    return Math.ceil(this.usuarios.length / this.elementosPorPagina);
  }

  paginaAnterior() {
    if (this.paginaActual > 1) {
      this.paginaActual--;
    }
  }

  paginaSiguiente() {
    if (this.paginaActual < this.totalPaginas()) {
      this.paginaActual++;
    }
  }

  aplicarFiltros() {
    this.buscarUsuario();
  }

  abrirModalCrear() {
    this.usuarioSeleccionado = {
      Id: 0,
      Nombre: '',
      Apellido: '',
      Correo: '',
      Telefono: '',
      FechaNacimiento: '',
      Imagen: '',
      EstadoId: null,
      RolId: null,
    };
    this.mostrarModal = true;
    this.modoVista = false;
  }

  abrirModalEditar(usuario: any) {
    // Asignar todos los campos al modal para edición
    this.usuarioSeleccionado = {
      Id: usuario.id || usuario.Id,
      Nombre: usuario.nombre || usuario.Nombre,
      Apellido: usuario.apellido || usuario.Apellido,
      Correo: usuario.correo || usuario.Correo,
      FechaNacimiento: usuario.fechaNacimiento ?? usuario.FechaNacimiento ?? null,
      Telefono: usuario.telefono || usuario.Telefono,
      Imagen: usuario.imagen || usuario.Imagen,
      Estado: usuario.estado ?? usuario.Estado ?? null,
      Rol: usuario.rol ?? usuario.Rol ?? null
    };
    // Asignar EstadoId y RolId de forma segura
    this.usuarioSeleccionado.EstadoId = usuario.estadoId ?? usuario.EstadoId ?? '';
    this.usuarioSeleccionado.RolId = usuario.rolId ?? usuario.RolId ?? '';
    
   // this.usuarioModalComponent.imagenPrevia = this.usuarioService.getImagenUrl(this.usuarioSeleccionado.Imagen!);
    console.log('Usuario para editar:', this.usuarioSeleccionado);
    this.mostrarModal = true;
    this.modoVista = false;

    setTimeout(() => {
      if (this.usuarioSeleccionado.Imagen) {
        const imagen = this.usuarioSeleccionado.Imagen;
      
        if (imagen.startsWith('data:image')) {
          // Es base64, asignar directamente
          this.usuarioModalComponent.imagenPrevia = imagen;
        } else {
          // Es nombre de imagen, usar método para obtener la URL del backend
          this.usuarioModalComponent.imagenPrevia = this.usuarioService.getImagenUrl(imagen);
        }
      }
      // Formatear FechaNacimiento para el input date
      if (this.usuarioSeleccionado.FechaNacimiento) {
      const fecha = new Date(this.usuarioSeleccionado.FechaNacimiento);
      const yyyy = fecha.getFullYear();
      const mm = String(fecha.getMonth() + 1).padStart(2, '0');
      const dd = String(fecha.getDate()).padStart(2, '0');
      this.usuarioSeleccionado.FechaNacimiento = `${yyyy}-${mm}-${dd}`;

      // Calcular edad automáticamente
      if(this.usuarioModalComponent) {
        this.usuarioModalComponent.usuario.FechaNacimiento = this.usuarioSeleccionado.FechaNacimiento;
        this.usuarioModalComponent.calcularEdad();
      }
    }
      }),0;
  }

  verUsuario(usuario: any) {
    this.usuarioSeleccionado = {
      Id: usuario.id || usuario.Id,
      Nombre: usuario.nombre || usuario.Nombre,
      Apellido: usuario.apellido || usuario.Apellido,
      Correo: usuario.correo || usuario.Correo,
      Telefono: usuario.telefono || usuario.Telefono,
      Imagen: usuario.imagen || usuario.Imagen,
      Estado: usuario.estado ?? usuario.Estado ?? null,
      Rol: usuario.rol ?? usuario.Rol ?? null,
      FechaNacimiento: usuario.fechaNacimiento ?? usuario.FechaNacimiento ?? null,
    };
    // Asignar EstadoId y RolId de forma segura
    this.usuarioSeleccionado.EstadoId = usuario.estadoId ?? usuario.EstadoId ?? '';
    this.usuarioSeleccionado.RolId = usuario.rolId ?? usuario.RolId ?? '';

    this.modoVista = true;
    this.mostrarModal = true; // Asegúrate de que este modal solo muestre información

    // Formatear FechaNacimiento para el input date
      if (this.usuarioSeleccionado.FechaNacimiento) {
      const fecha = new Date(this.usuarioSeleccionado.FechaNacimiento);
      const yyyy = fecha.getFullYear();
      const mm = String(fecha.getMonth() + 1).padStart(2, '0');
      const dd = String(fecha.getDate()).padStart(2, '0');
      this.usuarioSeleccionado.FechaNacimiento = `${yyyy}-${mm}-${dd}`;

      // Calcular edad automáticamente
      if(this.usuarioModalComponent) {
        this.usuarioModalComponent.usuario.FechaNacimiento = this.usuarioSeleccionado.FechaNacimiento;
        this.usuarioModalComponent.calcularEdad();
      }
    }
    
    setTimeout(() => {
      if (this.usuarioSeleccionado.Imagen) {
        const imagen = this.usuarioSeleccionado.Imagen;
    
        if (imagen.startsWith('data:image')) {
          // Es base64, asignar directamente
          this.usuarioModalComponent.imagenPrevia = imagen;
        } else {
          // Es nombre de imagen, usar método para obtener la URL del backend
          this.usuarioModalComponent.imagenPrevia = this.usuarioService.getImagenUrl(imagen);
        }
      }
      }),0;
  }

  guardarUsuario(usuario: any) {
    const usuarioParaGuardar = {
      ...usuario,
      Id: this.usuarioSeleccionado.Id || 0,  // Si es un nuevo usuario, el Id será 0
      RolId: this.usuarioSeleccionado.RolId,
      EstadoId: this.usuarioSeleccionado.EstadoId,
      Nombre: usuario.Nombre,
      Apellido: usuario.Apellido,
      Correo: usuario.Correo,
      Telefono: usuario.Telefono,
      FechaNacimiento: usuario.FechaNacimiento 
    };

    console.log('Datos preparados para enviar:', JSON.stringify(usuarioParaGuardar, null, 2));

    this.usuarioService.guardarUsuario(usuarioParaGuardar).subscribe({
      next: (response) => {
        console.log('Respuesta del servidor:', response);
        this.cargarUsuarios();  // Recargar la lista de usuarios
        this.cerrarModal();      // Cerrar el modal después de guardar

        // Mostrar mensaje de éxito dependiendo si es crear o editar
        if (!usuarioParaGuardar.Id) {
          Swal.fire({
            icon: 'success',
            title: 'Usuario creado',
            text: `Contraseña generada: Revise su Correo Electronico`
          });
        } else {
          Swal.fire({
            icon: 'success',
            title: 'Usuario actualizado',
            text: 'El usuario se ha actualizado correctamente.'
          });
        }
      },
      error: (error) => {
        console.error('Error completo:', error);
        let mensajeError = 'Error al guardar usuario';
        if (error.error?.errors) {
          mensajeError = Object.entries(error.error.errors)
            .map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(', ') : val}`)
            .join('\n');
        }
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: mensajeError
        });
      }
    });
  }

  eliminarUsuario(id: number) {
    Swal.fire({
      icon: 'warning',
      title: 'Confirmar eliminación',
      text: '¿Está seguro de eliminar este usuario?',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.usuarioService.eliminarUsuario(id).subscribe({
          next: () => {
            this.cargarUsuarios();
            Swal.fire({
              icon: 'success',
              title: 'Usuario eliminado',
              text: 'El usuario ha sido eliminado con éxito.'
            });
          },
          error: (error) => {
            console.error('Error al eliminar usuario:', error);
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'Hubo un problema al eliminar el usuario.'
            });
          }
        });
      }
    });
  }

  //ELIMINACIÖN LOGICA
  eliminarUsuarioLogico(id: number) {
    Swal.fire({
      icon: 'warning',
      title: 'Confirmar eliminación',
      text: '¿Está seguro de eliminar este usuario?',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        // Llamar al servicio con el ID para eliminar lógicamente
        this.usuarioService.eliminarUsuarioLogico(id).subscribe({
          next: () => {
            this.cargarUsuarios();  // Recargar la lista de usuarios
            Swal.fire({
              icon: 'success',
              title: 'Usuario eliminado',
              text: 'El usuario ha sido eliminado con éxito.'
            });
          },
          error: (error) => {
            console.error('Error al eliminar usuario:', error);
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'Hubo un problema al eliminar el usuario.'
            });
          }
        });
      }
    });
  }

  cerrarModal() {
    this.mostrarModal = false;
    this.usuarioSeleccionado = null;
  }
}
