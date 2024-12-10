import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FilterEditorComponent } from './filter-editor.component';

describe('QueryEditorComponent', () => {
  let component: FilterEditorComponent;
  let fixture: ComponentFixture<FilterEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FilterEditorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FilterEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
