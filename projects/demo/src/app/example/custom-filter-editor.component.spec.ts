import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomFilterEditorComponent } from './custom-filter-editor.component';
import { provideHttpClient } from '@angular/common/http';

describe('CustomQueryEditorComponent', () => {
  let component: CustomFilterEditorComponent;
  let fixture: ComponentFixture<CustomFilterEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomFilterEditorComponent],
      providers: [provideHttpClient()]
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
