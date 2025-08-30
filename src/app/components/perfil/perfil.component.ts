import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsuarioModalComponent, Usuario } from '../../Menu/Administracion/usuarios/usuarios-modal/usuarios-modal.component';
import { AuthService, User } from '../../services/auth.service';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, UsuarioModalComponent],
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.css']
})
export class PerfilComponent implements OnInit {
  usuarioActualMapped!: Usuario; // Usuario mapeado para el modal
  mostrarModal = false;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.cargarUsuario();
  }

  cargarUsuario(): void {
    // Nos suscribimos al usuario actual solo una vez
    this.authService.currentUser
      .pipe(take(1))
      .subscribe((usuario: User | null) => {
        if (usuario) {
          this.usuarioActualMapped = {
            Id: usuario.id,
            Nombre: usuario.name,
            Apellido: usuario.apellido,
            Correo: usuario.email,
            Telefono: (usuario as any).telefono, // si tu API no tiene, puedes omitir
            FechaNacimiento: usuario.fechaNacimiento,
            Imagen: usuario.imagen,
            Rol: { Nombre: usuario.role },
            Estado: { Nombre: (usuario as any).estadoNombre } // si aplica
          };
        }
      });
  }

  abrirPerfil(): void {
    this.mostrarModal = true;
  }

  cerrarModal(): void {
    this.mostrarModal = false;
  }

  calcularEdad(): number {
    if (!this.usuarioActualMapped?.FechaNacimiento) return 0;
    const fecha = new Date(this.usuarioActualMapped.FechaNacimiento);
    const diff = Date.now() - fecha.getTime();
    return new Date(diff).getUTCFullYear() - 1970;
  }
}
