import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomFilterEditorComponent } from './custom-filter-editor.component';

describe('CustomQueryEditorComponent', () => {
  let component: CustomFilterEditorComponent;
  let fixture: ComponentFixture<CustomFilterEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomFilterEditorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomFilterEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
