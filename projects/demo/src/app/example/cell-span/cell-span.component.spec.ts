import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CellSpanComponent } from './cell-span.component';
import { provideHttpClient } from '@angular/common/http';
import { DebugElement } from '@angular/core';

//ng test demo --include="projects/demo/src/app/example/cell-span/cell-span.component.spec.ts"

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

  it('check cell span', async () => {
    expect(component).toBeTruthy();
    await fixture.whenStable();
    fixture.detectChanges();

    const debugElement: DebugElement = fixture.debugElement;
    const componentEl: HTMLElement = debugElement.nativeElement;
    let rowList = componentEl.querySelectorAll('tbody tr') as NodeListOf<HTMLElement>;
    let tdList = rowList[0].querySelectorAll('td') as NodeListOf<HTMLElement>;
    expect(tdList[1].getAttribute('rowspan')).toBe("3");//country Afghanistan
    expect(tdList[1].textContent?.trim()).toBe("Afghanistan");//country Afghanistan
    expect(tdList[2].getAttribute('colspan')).toBe("2");//name cell
    expect(tdList[2].textContent?.trim()).toBe("Tracey Bucknall");
    expect(tdList[3].textContent?.trim()).toBe("Male");//the email cell shouldn't exist.

    //second row
    tdList = rowList[1].querySelectorAll('td') as NodeListOf<HTMLElement>;
    expect(tdList[1].textContent?.trim()).toBe("Dede Glawsop");//the country cell doesn't exist
    expect(tdList[2].textContent?.trim()).toBe("dglawsop3o@ca.gov");
  });
});
