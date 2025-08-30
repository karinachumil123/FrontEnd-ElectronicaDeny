import { Directive, Input, OnInit, TemplateRef, ViewContainerRef } from '@angular/core';
import { AuthService } from '../app/services/auth.service';

@Directive({
  standalone: false,
  selector: '[appHasPermission]'
})
export class HasPermissionDirective implements OnInit {
  private permisos: string = '';
  private isHidden = true;

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private authService: AuthService
  ) { }

  @Input() set appHasPermission(permisos: string) {
    this.permisos = permisos;
    this.updateView();
  }

  ngOnInit() {
    this.updateView();
  }

  private updateView() {
    if (this.authService.hasPermission(this.permisos)) {
      if (this.isHidden) {
        this.viewContainer.createEmbeddedView(this.templateRef);
        this.isHidden = false;
      }
    } else {
      this.viewContainer.clear();
      this.isHidden = true;
    }
  }
}