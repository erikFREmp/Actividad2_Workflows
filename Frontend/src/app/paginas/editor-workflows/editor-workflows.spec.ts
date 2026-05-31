import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditorWorkflows } from './editor-workflows';

describe('EditorWorkflows', () => {
  let component: EditorWorkflows;
  let fixture: ComponentFixture<EditorWorkflows>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditorWorkflows]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditorWorkflows);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
