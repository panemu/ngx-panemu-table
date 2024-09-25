import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CellSpanComponent } from './cell-span.component';
import { provideHttpClient } from '@angular/common/http';

describe('CellSpanComponent', () => {
  let component: CellSpanComponent;
  let fixture: ComponentFixture<CellSpanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CellSpanComponent],
      providers: [provideHttpClient()]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CellSpanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
