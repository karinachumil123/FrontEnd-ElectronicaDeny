import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { InicioComponent } from './Menu/inicio/inicio.component';
import { OpcionesMenuComponent } from './components/sidebar/opciones-menu.component';
import { UsuariosComponent } from './Menu/Administracion/usuarios/usuarios/usuarios.component';
import { UsuarioModalComponent } from './Menu/Administracion/usuarios/usuarios-modal/usuarios-modal.component';
import { AccessoDenegadoComponent } from './components/acceso-denegado/acceso-denegado.component';
import { RolesComponent } from './Menu/Administracion/roles/roles/roles.component';
import { RolesModalComponent } from './Menu/Administracion/roles/roles-modal/roles-modal.component';
import { AuthGuard } from './guards/auth.guard';
import { PerfilComponent } from './components/perfil/perfil.component';
import { ReporteUsuarioComponent } from './Menu/Reportes/reporte-usuario/reporte-usuario.component';
import { ReporteVentaComponent } from './Menu/Reportes/reporte-venta/reporte-venta.component';
import { ReportePedidosComponent } from './Menu/Reportes/reporte-pedidos/reporte-pedidos.component';
import { ReporteInventarioComponent } from './Menu/Reportes/reporte-inventario/reporte-inventario.component';
import { ContactoComponent } from './Menu/Administracion/contacto/contacto/contacto.component';
import { ContactoModalComponent } from './Menu/Administracion/contacto/contacto-modal/contacto-modal.component';

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { 
    path: 'login', component: LoginComponent,
  
  },
  {
    path: 'no-autorizado', component: AccessoDenegadoComponent,
  },
  { 
    path: 'home', component: OpcionesMenuComponent,
    children: [
      { path: 'inicio', component: InicioComponent, canActivate: [AuthGuard]  },
      { path: '', redirectTo: 'inicio', pathMatch: 'full' },
      { path: 'perfil', component: PerfilComponent, canActivate: [AuthGuard] },
      { path: 'administracion/usuarios', component: UsuariosComponent, canActivate: [AuthGuard], data: { permiso: 'Ver Usuarios' } },
      { path: 'administracion/usuario-modal', component: UsuarioModalComponent, canActivate: [AuthGuard], data: { permiso: 'Ver Usuarios' }},
      { path: 'administracion/roles', component: RolesComponent, canActivate: [AuthGuard], data: { permiso: 'Ver Roles' } },
      { path: 'administracion/roles-modal', component: RolesModalComponent, canActivate: [AuthGuard], data: { permiso: 'Ver Roles' } },
      { path: 'administracion/contacto', component: ContactoComponent, canActivate: [AuthGuard], data: { permiso: 'Ver Contacto' }  },
      { path: 'administracion/contacto-modal', component: ContactoModalComponent, canActivate: [AuthGuard], data: { permiso: 'Ver Contacto' } },
      { path: 'reportes/usuarios', component: ReporteUsuarioComponent, canActivate: [AuthGuard], data: { permiso: 'Ver Reportes de Usuarios' }},
      { path: 'reportes/ventas', component: ReporteVentaComponent, canActivate: [AuthGuard], data: { permiso: 'Ver Reportes de Ventas' }},
      { path: 'reportes/pedidos', component: ReportePedidosComponent, canActivate: [AuthGuard], data: { permiso: 'Ver Reportes de Pedidos' } },
      { path: 'reportes/inventario', component: ReporteInventarioComponent, canActivate: [AuthGuard], data: { permiso: 'Ver Reportes de Inventario' } },
    ]
  },
  { path: '**', redirectTo: 'login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
