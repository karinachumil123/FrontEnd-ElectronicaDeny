import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private readonly apiUrl = `${environment.apiUrl}/api`;
  private readonly apiBaseUrl = `${environment.apiUrl}/api/Usuarios`; // Nueva propiedad para imágenes

  private rolesSubject = new BehaviorSubject<any[]>([]);
  private estadosSubject = new BehaviorSubject<any[]>([]);

  constructor(private http: HttpClient) { }

  // Método para obtener URL de imágenes
  public getImagenUrl(nombreImagen: string): string {
    return `${this.apiBaseUrl}/imagenes/${nombreImagen}`;
  }

  // Cargar los roles y estados
  cargarRoles(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/roles`).pipe(
      map(roles => roles.map(rol => {
        if (rol.id && !rol.Id) rol.Id = rol.id;
        if (rol.nombre && !rol.Nombre) rol.Nombre = rol.nombre;
        return rol;
      })),
      tap(roles => {
        console.log('Roles cargados:', roles);
        this.rolesSubject.next(roles);
      }),
      catchError(error => {
        console.error('Error al cargar roles:', error);
        return throwError(() => error);
      })
    );
  }

  cargarEstados(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/estados`).pipe(
      map(estados => estados.map(estado => {
        if (estado.id && !estado.Id) estado.Id = estado.id;
        if (estado.nombre && !estado.Nombre) estado.Nombre = estado.nombre;
        return estado;
      })),
      tap(estados => {
        console.log('Estados cargados:', estados);
        this.estadosSubject.next(estados);
      }),
      catchError(error => {
        console.error('Error al cargar estados:', error);
        return throwError(() => error);
      })
    );
  }

  // Obtener usuarios
  obtenerUsuarios(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/usuario`).pipe(
      map(usuarios => usuarios.map(usuario => ({
        ...usuario,
        Id: usuario.id || usuario.Id,
        EstadoId: usuario.estadoId || usuario.EstadoId,
        RolId: usuario.rolId || usuario.RolId,
        estadoNombre: usuario.estado?.nombre || usuario.Estado?.Nombre,
        rolNombre: usuario.rol?.nombre || usuario.Rol?.Nombre
      }))),
      catchError(this.handleError)
    );
  }

  obtenerUsuarioPorId(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/usuarios/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  // Métodos para obtener roles y estados
  obtenerRoles(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/roles`).pipe(
      tap(roles => console.log('Datos de roles recibidos:', roles)),
      catchError(this.handleError)
    );
  }

  obtenerEstados(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/estados`).pipe(
      tap(estados => console.log('Datos de estados recibidos:', estados)),
      catchError(this.handleError)
    );
  }

  // Obtener valores actuales de roles y estados
  getRolesValue(): any[] {
    if (this.rolesSubject.getValue().length === 0) {
      this.cargarRoles().subscribe();
    }
    return this.rolesSubject.getValue();
  }

  getEstadosValue(): any[] {
    if (this.estadosSubject.getValue().length === 0) {
      this.cargarEstados().subscribe();
    }
    return this.estadosSubject.getValue();
  }

  // Guardar usuario
  guardarUsuario(usuario: any): Observable<any> {
    const usuarioParaEnviar = { ...usuario };
    const roles = this.getRolesValue();
    const estados = this.getEstadosValue();

    if (!usuario.Id) {
      const contrasenaGenerada = this.generarContrasena();
      usuarioParaEnviar.Contrasena = contrasenaGenerada;
      usuarioParaEnviar.Estado = estados.find(e =>
        (e.Id === usuario.EstadoId) || (e.id === usuario.EstadoId)
      );
      usuarioParaEnviar.Rol = roles.find(r =>
        (r.Id === usuario.RolId) || (r.id === usuario.RolId)
      );

      return this.http.post<any>(`${this.apiUrl}/usuario`, usuarioParaEnviar).pipe(
        tap(response => {
          response.contrasenaGenerada = contrasenaGenerada;
        }),
        catchError(this.handleError)
      );
    } else {
      usuarioParaEnviar.Estado = estados.find(e =>
        (e.Id === usuario.EstadoId) || (e.id === usuario.EstadoId)
      );
      usuarioParaEnviar.Rol = roles.find(r =>
        (r.Id === usuario.RolId) || (r.id === usuario.RolId)
      );

      return this.http.put<any>(`${this.apiUrl}/usuario/${usuario.Id}`, usuarioParaEnviar).pipe(
        catchError(this.handleError)
      );
    }
  }

  subirImagen(archivo: File): Observable<string> {
    const formData = new FormData();
    formData.append('archivo', archivo);
    return this.http.post<string>('https://localhost:56232/api/usuarios/subir-imagen', formData);
  }
  

  // Eliminar usuario
  eliminarUsuario(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/usuario/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  // Generar contraseña
  private generarContrasena(): string {
    const caracteres = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%^&*';
    let contrasena = '';
    for (let i = 0; i < 10; i++) {
      contrasena += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
    }
    return contrasena;
  }

  // Manejo de errores
  private handleError(error: any): Observable<never> {
    console.error('Error detallado:', error);
    let mensajeError = 'Ha ocurrido un error';

    if (error?.error?.errors) {
      mensajeError = Object.entries(error.error.errors)
        .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
        .join('\n');
    } else if (error?.error?.message) {
      mensajeError = error.error.message;
    } else if (error?.message) {
      mensajeError = error.message;
    }

    return throwError(() => new Error(mensajeError));
  }

  // Eliminar usuario (eliminación lógica)
  eliminarUsuarioLogico(id: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/usuario/eliminar-logico/${id}`, {});
  }


  descargarReporteUsuarios(): Observable<Blob> {
  return this.http.get('http://localhost:5010/api/Usuario/reporte/pdf', { responseType: 'blob' });
}

}
