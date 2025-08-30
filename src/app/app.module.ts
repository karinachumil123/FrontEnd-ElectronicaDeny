import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';

import { AppComponent } from './app.component';
import { InicioComponent } from './Menu/inicio/inicio.component';
import { LoginComponent } from './components/login/login.component';
import { OpcionesMenuComponent } from './components/sidebar/opciones-menu.component';
import { UsuariosComponent } from './Menu/Administracion/usuarios/usuarios/usuarios.component';
import { AccessoDenegadoComponent } from './components/acceso-denegado/acceso-denegado.component';
import { OlvidarContrasenaComponent } from './components/olvidar-contrasenia/olvidar-contrasenia.component';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { RolesComponent } from './Menu/Administracion/roles/roles/roles.component';
import { RolesModalComponent } from './Menu/Administracion/roles/roles-modal/roles-modal.component';
import { FormsModule } from '@angular/forms';
import { PermisosModalComponent } from './Menu/Administracion/roles/permisos-modal/permisos-modal.component';
import { JwtModule } from '@auth0/angular-jwt';

// Importar el interceptor
import { JwtInterceptor } from './interceptors/jwt.interceptors';
import { UsuarioModalComponent } from './Menu/Administracion/usuarios/usuarios-modal/usuarios-modal.component';
import { PerfilComponent } from './components/perfil/perfil.component';
import { ReporteUsuarioComponent } from './Menu/Reportes/reporte-usuario/reporte-usuario.component';
import { ReporteVentaComponent } from './Menu/Reportes/reporte-venta/reporte-venta.component';
import { ReportePedidosComponent } from './Menu/Reportes/reporte-pedidos/reporte-pedidos.component';
import { ContactoComponent } from './Menu/Administracion/contacto/contacto/contacto.component';
import { ContactoModalComponent } from './Menu/Administracion/contacto/contacto-modal/contacto-modal.component';

// Función para obtener el token
export function tokenGetter() {
  return localStorage.getItem('token');
}

@NgModule({
  declarations: [
    AppComponent,
    InicioComponent,
    OpcionesMenuComponent,
    AccessoDenegadoComponent,
    RolesComponent,
    RolesModalComponent,
    PermisosModalComponent,
    ContactoComponent,
    ContactoModalComponent,
  ],
  imports: [
    BrowserModule,
    LoginComponent,
    AppRoutingModule,
    UsuariosComponent,
    UsuarioModalComponent,
    OlvidarContrasenaComponent,
    PerfilComponent,
    ReporteUsuarioComponent,
    ReporteVentaComponent,
    ReportePedidosComponent,
    HttpClientModule,
    FormsModule,
    JwtModule.forRoot({
  config: {
    tokenGetter: () => {
      return localStorage.getItem('token');
    },
    allowedDomains: ['localhost:5010'],
    disallowedRoutes: ['http://localhost:5010/api/auth/login']
  }
})
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
