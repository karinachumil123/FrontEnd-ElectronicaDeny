import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactoModalComponent } from './contacto-modal.component';

describe('ContactoModalComponent', () => {
  let component: ContactoModalComponent;
  let fixture: ComponentFixture<ContactoModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContactoModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContactoModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
