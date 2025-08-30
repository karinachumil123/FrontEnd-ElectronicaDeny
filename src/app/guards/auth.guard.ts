import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    console.log('AuthGuard: Checking authentication...');

    // 1. Verificar autenticación
    const usuario = this.authService.currentUserValue;
    if (!usuario) {
      console.log('AuthGuard: Usuario no autenticado, redirigiendo al login');
      this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
      return false;
    }

    console.log('AuthGuard: Usuario autenticado:', usuario);

    // 2. Si es Admin, acceso total
    if (usuario.role === 'Admin') {
      console.log('AuthGuard: Usuario administrador, acceso total');
      return true;
    }

    // 3. Verificar permiso requerido
    const permisoRequerido = route.data['permiso'];
    if (permisoRequerido && !this.authService.tienePermiso(permisoRequerido)) {
      console.log(`AuthGuard: Usuario sin permiso '${permisoRequerido}', redirigiendo a no-autorizado`);
      this.router.navigate(['/no-autorizado']);
      return false;
    }

    // 4. Si no requiere permiso, permitir acceso
    return true;
  }
}
