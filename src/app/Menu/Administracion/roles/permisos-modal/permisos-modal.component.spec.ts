import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PermisosModalComponent } from './permisos-modal.component';

describe('PermisosModalComponent', () => {
  let component: PermisosModalComponent;
  let fixture: ComponentFixture<PermisosModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PermisosModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PermisosModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
