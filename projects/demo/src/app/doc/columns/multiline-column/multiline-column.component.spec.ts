import { ComponentFixture, TestBed } from '@angular/core/testing';

import { provideHttpClient } from '@angular/common/http';
import { MultilineColumnnComponent } from './multiline-column.component';
import { DebugElement } from '@angular/core';

//ng test demo --include="projects/demo/src/app/doc/columns/multiline-column/multiline-column.component.spec.ts"

describe('MultilineColumnnComponent', () => {
  let component: MultilineColumnnComponent;
  let fixture: ComponentFixture<MultilineColumnnComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MultilineColumnnComponent],
      providers: [provideHttpClient()]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MultilineColumnnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('check multiline', async () => {
    await fixture.whenStable(); //wait for controller.reloadData()
    fixture.detectChanges();

    const bannerDe: DebugElement = fixture.debugElement;
    const bannerEl: HTMLElement = bannerDe.nativeElement;
    let rows = bannerEl.querySelectorAll('table tbody tr') as NodeListOf<HTMLElement>;
    const cssRowHeight = 32;
    expect(rows[0].clientHeight).toBe(cssRowHeight);//32 is the row height set in css
    expect(rows[1].clientHeight > (cssRowHeight * 2)).toBe(true);
    expect(rows[2].clientHeight).toBe(cssRowHeight);
  });
});
