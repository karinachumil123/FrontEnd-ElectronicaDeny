// services/empresa.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Empresa {
  id?: number;
  nombre: string;
  telefono: string;
  correo: string;
  direccion: string;
}

@Injectable({
  providedIn: 'root'
})
export class EmpresaService {
  private apiUrl = `${environment.apiUrl}/api/Empresa`;

  constructor(private http: HttpClient) {}

  obtenerEmpresa(): Observable<Empresa> {
    // Asume que el backend devuelve la info de la empresa principal sin parámetro
    return this.http.get<Empresa>(this.apiUrl);
  }

  actualizarEmpresa(empresa: Empresa): Observable<Empresa> {
    // Si tu API requiere el ID en la URL, ajusta así:
    // return this.http.put<Empresa>(`${this.apiUrl}/${empresa.id}`, empresa);

    return this.http.put<Empresa>(this.apiUrl, empresa);
  }
}