import { ComponentFixture, TestBed } from '@angular/core/testing';

import { provideHttpClient } from '@angular/common/http';
import { StickyColumnComponent } from './sticky-column.component';
import { DebugElement } from '@angular/core';

//ng test demo --include="projects/demo/src/app/example/sticky-column.component.spec.ts"
describe('StickyColumnComponent', () => {
  let component: StickyColumnComponent;
  let fixture: ComponentFixture<StickyColumnComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StickyColumnComponent],
      providers: [provideHttpClient()]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StickyColumnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('check left and right style of sticky columns', async () => {
    await fixture.whenStable(); //wait for controller.reloadData()
    fixture.detectChanges();

    const componentDe: DebugElement = fixture.debugElement;
    const componentEl: HTMLElement = componentDe.nativeElement;

    let firstRow = componentEl.querySelector('table tbody tr');
    let tdList = firstRow?.querySelectorAll('td')  as NodeListOf<HTMLElement>;
    expect(tdList[0].style.left).toBe('0px');
    expect(tdList[1].style.left).toBe(tdList[0].offsetWidth + 'px');

    expect(tdList[tdList.length - 1].style.right).toBe('0px');
    expect(tdList[tdList.length - 2].style.right).toBe(tdList[tdList.length - 1].offsetWidth + 'px');
  });
});
