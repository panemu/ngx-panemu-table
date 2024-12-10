import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomRowGroupComponent } from './custom-row-group.component';
import { provideHttpClient } from '@angular/common/http';

describe('CustomRowGroupComponent', () => {
  let component: CustomRowGroupComponent;
  let fixture: ComponentFixture<CustomRowGroupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomRowGroupComponent],
      providers: [provideHttpClient()]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomRowGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
