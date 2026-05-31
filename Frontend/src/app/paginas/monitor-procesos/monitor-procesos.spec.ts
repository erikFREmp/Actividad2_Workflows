import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MonitorProcesos } from './monitor-procesos';

describe('MonitorProcesos', () => {
  let component: MonitorProcesos;
  let fixture: ComponentFixture<MonitorProcesos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MonitorProcesos]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MonitorProcesos);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
