import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { AuthService, User } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-opciones-menu',
  standalone: false,
  templateUrl: './opciones-menu.component.html',
  styleUrls: ['./opciones-menu.component.css'], 
})
export class OpcionesMenuComponent implements OnInit  {
  menuVisible: boolean = true;
  showMenu: boolean = false;
  isMobile: boolean = window.innerWidth < 768;

  isDropdownOpen = {
    caja: false,
    productos: false,
    inventario: false,
    ventas: false,
    administracion: false,
    reportes: false,
    usuario: false
  };

  // Aquí guardamos al usuario logueado
  currentUser: User | null = null;
  screenSmall: boolean = false;

  // Para el modal
  mostrarModal: boolean = false;
  usuarioSeleccionado: User | null = null;
  modoVista: 'ver' | 'editar' | 'crear' = 'ver';

  @ViewChild('dropdownContainer') dropdownContainer!: ElementRef;

  constructor(
    public authService: AuthService,
    private router: Router
  ) {}

  @HostListener('window:resize')
  onResize() {
    this.isMobile = window.innerWidth < 768;
    if (!this.isMobile) this.menuVisible = true;
  }

  ngOnInit() {
    // Suscribirse al observable del usuario logueado
    this.authService.getUsuarioActual().subscribe(user => {
      this.currentUser = user;
    });

    this.screenSmall = window.innerWidth < 768;
    if (this.screenSmall) this.menuVisible = false;
  }

  goToInicio(): void { this.router.navigate(['/home/inicio']); }

  toggleDropdown(menu: string) {
    Object.keys(this.isDropdownOpen).forEach(key => {
      if (key !== menu) this.isDropdownOpen[key as keyof typeof this.isDropdownOpen] = false;
    });
    this.isDropdownOpen[menu as keyof typeof this.isDropdownOpen] = !this.isDropdownOpen[menu as keyof typeof this.isDropdownOpen];
  }

  toggleUserMenu(): void { this.showMenu = !this.showMenu; }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.showMenu && this.dropdownContainer &&
        !this.dropdownContainer.nativeElement.contains(event.target)) {
      this.showMenu = false;
    }
  }

  verPerfil() { this.router.navigate(['/home/perfil']); }
  // Abrir modal de perfil solo lectura
  abrirPerfilUsuario() {
    if (!this.currentUser) return;
    this.usuarioSeleccionado = this.currentUser; 
    this.modoVista = 'ver'; // solo ver
    this.mostrarModal = true;
  }

  cerrarModal() {
    this.mostrarModal = false;
    this.usuarioSeleccionado = null;
  }

  cerrarSesion() {
    this.authService.logout().subscribe({
      next: () => this.router.navigate(['/login']),
      error: () => this.router.navigate(['/login'])
    });
  }

  toggleMenu(): void { this.menuVisible = !this.menuVisible; }
}
