import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

// Interfaces para tipos de datos
export interface Rol {
    id?: number;
    nombre: string;
    descripcion?: string;
}

export interface Usuario {
    id: number;
    nombre: string;
}

export interface Permiso {
    id: number;
    nombre: string;
    codigo: string;
}

@Injectable({
    providedIn: 'root'
})
export class RolUsuarioService {
    private apiUrl = `${environment.apiUrl}/api/roles`;

    constructor(private http: HttpClient) { }

    private handleError(error: HttpErrorResponse) {
        console.error('Error en servicio RolUsuario:', error);
        return throwError(() => new Error('Ocurrió un error. Por favor intente nuevamente.'));
    }

    actualizarPermisosDeRol(rolId: number, permisoIds: number[]): Observable<any> {
    return this.http.put<any>(`${environment.apiUrl}/api/RolPermisos/${rolId}/actualizar-permisos`, permisoIds)
        .pipe(catchError(this.handleError));
}

    // 1. Crear un rol
    crearRol(rol: Rol): Observable<Rol> {
        return this.http.post<Rol>(this.apiUrl, rol)
            .pipe(
                catchError(this.handleError)
            );
    }

    // 2. Obtener todos los roles
    obtenerRoles(): Observable<Rol[]> {
        return this.http.get<Rol[]>(this.apiUrl)
            .pipe(
                catchError(this.handleError)
            );
    }

    // 3. Obtener un rol por su ID
    obtenerRolPorId(id: number): Observable<Rol> {
        return this.http.get<Rol>(`${this.apiUrl}/${id}`)
            .pipe(
                catchError(this.handleError)
            );
    }

    // 4. Editar un rol
    actualizarRol(id: number, rol: Rol): Observable<Rol> {
        return this.http.put<Rol>(`${this.apiUrl}/${id}`, rol)
            .pipe(
                catchError(this.handleError)
            );
    }

    // 5. Eliminar un rol
    eliminarRol(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`)
            .pipe(
                catchError(this.handleError)
            );
    }

    // 8. Obtener usuarios asignados a un rol
    obtenerUsuariosPorRol(rolId: number): Observable<Usuario[]> {
        return this.http.get<Usuario[]>(`${this.apiUrl}/${rolId}/usuarios`)
            .pipe(
                catchError(this.handleError)
            );
    }

    // 10. Obtener todos los permisos disponibles
    obtenerTodosLosPermisos(): Observable<Permiso[]> {
        return this.http.get<Permiso[]>(`${environment.apiUrl}/api/Permisos`)
            .pipe(
                catchError(this.handleError)
            );       
    }

    // Asignar permisos a un rol
asignarPermisosARol(rolId: number, permisoIds: number[]): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${rolId}/permisos`, permisoIds)
        .pipe(catchError(this.handleError));
}

// Obtener permisos de un rol
obtenerPermisosDeRol(rolId: number): Observable<Permiso[]> {
    return this.http.get<Permiso[]>(`${this.apiUrl}/${rolId}/permisos`)
        .pipe(catchError(this.handleError));
}

}