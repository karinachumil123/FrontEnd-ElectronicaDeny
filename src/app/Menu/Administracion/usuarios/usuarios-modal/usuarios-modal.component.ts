import { Component, Input, Output, EventEmitter, OnInit, ViewChild, SimpleChanges } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { UsuarioService } from '../../../../services/usuario.service';
import { finalize } from 'rxjs/operators';
import { CommonModule, DOCUMENT } from '@angular/common';
import { Inject } from '@angular/core';
import Swal from 'sweetalert2';

// Interfaces para tipado fuerte
export interface Usuario {
  Id?: number;
  Nombre?: string;
  Apellido?: string;
  Correo?: string;
  Telefono?: string;
  FechaNacimiento?: Date | string;
  Imagen?: string;
  EstadoId?: number;
  RolId?: number;
  Estado?: any;
  Rol?: any;
}

@Component({
  selector: 'app-usuario-modal',
  standalone: true,
  templateUrl: './usuarios-modal.component.html',
  styleUrls: ['./usuarios-modal.component.css'],
  imports: [FormsModule, CommonModule]
})
export class UsuarioModalComponent implements OnInit {
  @Input() usuario: Usuario = {};
  @Output() cerrar = new EventEmitter<void>();
  @Output() guardar = new EventEmitter<Usuario>();
  @ViewChild('usuarioForm') usuarioForm!: NgForm;
  @Input() modoVista: boolean = false;
  

  roles: any[] = [];
  estados: any[] = [];
  imagenPrevia: string | ArrayBuffer | null = null;
  archivoImagen!: File;
  cargando = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['usuario']) {
      if (this.usuario.FechaNacimiento) {
        this.calcularEdad();
        // Formatear fecha para input date
        const fecha = new Date(this.usuario.FechaNacimiento);
        const yyyy = fecha.getFullYear();
        const mm = String(fecha.getMonth() + 1).padStart(2, '0');
        const dd = String(fecha.getDate()).padStart(2, '0');
        this.usuario.FechaNacimiento = `${yyyy}-${mm}-${dd}`;
      }

      if (this.usuario.Rol && !this.usuario.RolId) {
        this.usuario.RolId = this.usuario.Rol.Id;
      }
      if (this.usuario.Estado && !this.usuario.EstadoId) {
        this.usuario.EstadoId = this.usuario.Estado.Id;
      }
    }
  }

  constructor(
    private usuarioService: UsuarioService,
    @Inject(DOCUMENT) private document: Document
  ) { }

  ngOnInit(): void {
    console.log(this.usuario)
    this.cargarDatos();
    if (this.usuario.FechaNacimiento) {
    this.calcularEdad();
  }

    if (this.usuario.Imagen) {
      if (this.usuario.Imagen.startsWith('data:image')) {
        // Ya es base64
        this.imagenPrevia = this.usuario.Imagen;
      } else {
        // Es un nombre de archivo, genera la URL del backend
        this.imagenPrevia = this.getImagenUrl(this.usuario.Imagen);
      }
    }
    
  }

  minFechaNacimiento = '1940-01-01'; // Fecha mínima
  maxFechaNacimiento = new Date().toISOString().split('T')[0]; // Fecha máxima (hoy)
  edad!: number;

  calcularEdad() {
    if (this.usuario.FechaNacimiento) {
      const fechaNacimiento = new Date(this.usuario.FechaNacimiento);
      const diferencia = Date.now() - fechaNacimiento.getTime();
      this.edad = new Date(diferencia).getUTCFullYear() - 1970;
    }
  }

  cargarDatos(): void {
    this.usuarioService.obtenerRoles().subscribe(roles => {
      console.log('Roles recibidos en modal:', roles);
      this.roles = roles;
      if (!this.usuario.Id && roles.length > 0) {
        const rolVendedor = roles.find(r => r.Nombre?.toLowerCase() === 'vendedor');
        if (rolVendedor) {
          this.usuario.RolId = rolVendedor.Id;
          console.log('Rol por defecto establecido:', rolVendedor);
        }
      }else if (this.usuario.Rol) {
      // ✅ Asignar rol existente
      this.usuario.RolId = this.usuario.Rol.Id;
      }
    });
    this.usuarioService.obtenerEstados().subscribe(estados => {
      console.log('Estados recibidos en modal:', estados);
      this.estados = estados;
      if (!this.usuario.Id && estados.length > 0) {
        const estadoActivo = estados.find(e => e.Nombre?.toLowerCase() === 'activo');
        if (estadoActivo) {
          this.usuario.EstadoId = estadoActivo.Id;
          console.log('Estado por defecto establecido:', estadoActivo);
        }
      }else if (this.usuario.Estado) {
      // ✅ Asignar estado existente
      this.usuario.EstadoId = this.usuario.Estado.Id;
    }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];

    if (!file.type.match('image/jpeg') && !file.type.match('image/png')) {
      alert('Solo se permiten archivos JPG o PNG');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert('La imagen no debe superar los 2MB');
      return;
    }

    this.archivoImagen = file;
    this.usuario.Imagen = file.name;

    const reader = new FileReader();
    reader.onload = () => {
      this.imagenPrevia = reader.result;
    };
    reader.readAsDataURL(file);
  }
  

  onFileInputClick(): void {
    this.document.getElementById('fileInput')?.click();
  }

  getImagenUrl(nombreImagen: string): string {
    if (!nombreImagen) return 'assets/images/default-user.png';

    // Si ya es base64, no lo concatenamos a la URL
    if (nombreImagen.startsWith('data:image')) {
      return nombreImagen;
    }

    return this.usuarioService.getImagenUrl(nombreImagen);
  }

  convertirArchivoABase64(file: File): Promise<string | undefined> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
  
      reader.onload = () => {
        const resultado = reader.result;
        if (typeof resultado === 'string') {
          resolve(resultado);
        } else {
          resolve(undefined); // Si no es string, devolvemos undefined
        }
      };
  
      reader.onerror = error => {
        reject(error);
      };
  
      reader.readAsDataURL(file);
    });
  }
  

  async onSubmit(): Promise<void> {
    if (this.cargando) return;
  
    if (this.usuarioForm.invalid || !this.validarFormulario()) {
      this.marcarCamposComoTocados();
      return;
    }
  
    this.cargando = true;
  
    try {
      let base64: string | undefined = undefined;
  
      if (this.archivoImagen) {
        base64 = await this.convertirArchivoABase64(this.archivoImagen);
      }
  
      const usuarioCompleto: Usuario = {
        ...this.usuario,
        Estado: this.estados.find(e => e.Id === this.usuario.EstadoId),
        Rol: this.roles.find(r => r.Id === this.usuario.RolId),
        Imagen: base64 ?? this.usuario.Imagen
      };
  
      this.guardar.emit(usuarioCompleto);
    } catch (error: any) {
      this.cargando = false;
      if (error.status === 400 && error.error?.errors) {
        const errores = Object.values(error.error.errors).flat().join('\n');
        Swal.fire({
          icon: 'error',
          title: 'Errores de validación',
          text: errores
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Ocurrió un error al guardar el usuario. Intente nuevamente.'
        });
      }
    } finally {
      this.cargando = false;
    }
  }

  private validarFormulario(): boolean {
    const camposRequeridos = [
      { campo: this.usuario.Nombre?.trim(), mensaje: 'El nombre es requerido' },
      { campo: this.usuario.Apellido?.trim(), mensaje: 'El apellido es requerido' },
      { campo: this.usuario.Correo?.trim(), mensaje: 'El correo es requerido' },
      { campo: this.usuario.Telefono?.trim(), mensaje: 'El teléfono es requerido' },
      { campo: this.usuario.EstadoId, mensaje: 'El estado es requerido' },
      { campo: this.usuario.RolId, mensaje: 'El rol es requerido' }
    ];

    for (const { campo, mensaje } of camposRequeridos) {
      if (!campo) {
        alert(mensaje);
        return false;
      }
    }

    if (!this.validarCorreo(this.usuario.Correo!)) {
      alert('El correo no tiene un formato válido');
      return false;
    }

    return true;
  }

  private marcarCamposComoTocados(): void {
    Object.values(this.usuarioForm.controls).forEach(control => {
      control.markAsTouched();
    });
  }

  private validarCorreo(correo: string): boolean {
    const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return regex.test(correo);
  }

  cerrarModal(): void {
    this.cerrar.emit();
  }
}