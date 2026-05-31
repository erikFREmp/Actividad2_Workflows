import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BandejaTareas } from './bandeja-tareas';

describe('BandejaTareas', () => {
  let component: BandejaTareas;
  let fixture: ComponentFixture<BandejaTareas>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BandejaTareas]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BandejaTareas);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
