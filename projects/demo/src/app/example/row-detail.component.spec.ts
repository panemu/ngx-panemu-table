import { ComponentFixture, TestBed } from '@angular/core/testing';

import { provideHttpClient } from '@angular/common/http';
import { DebugElement } from '@angular/core';
import { RowDetailComponent } from './row-detail.component';

//ng test demo --include="projects/demo/src/app/example/row-detail.component.spec.ts"
describe('RowDetailComponent', () => {
  let component: RowDetailComponent;
  let fixture: ComponentFixture<RowDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RowDetailComponent],
      providers: [provideHttpClient()]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RowDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('Check expansion', async () => {
    await fixture.whenStable(); //wait for controller.reloadData()
    fixture.detectChanges();

    const componentDe: DebugElement = fixture.debugElement;
    const componentEl: HTMLElement = componentDe.nativeElement;

    let firstRowButtonList = componentEl.querySelectorAll('table tbody tr:nth-child(1) button') as NodeListOf<HTMLElement>;
    
    expect(firstRowButtonList.length).toBe(4);

    //click email expansion button
    firstRowButtonList.item(0).click();
    fixture.detectChanges();
    let secondRow = componentEl.querySelector('table tbody tr:nth-child(2)');
    expect(secondRow?.textContent?.trim().startsWith('Send Email')).toBeTrue();

    //click country expansion button
    firstRowButtonList.item(1).click();
    fixture.detectChanges();
    secondRow = componentEl.querySelector('table tbody tr:nth-child(2)');
    expect(secondRow?.querySelector('panemu-table')).toBeDefined();

    //click country expansion button again to collapse
    firstRowButtonList.item(1).click();
    fixture.detectChanges();
    secondRow = componentEl.querySelector('table tbody tr:nth-child(2)');
    expect(secondRow?.querySelector('panemu-table')).toBeNull();

    //expand the edit
    firstRowButtonList.item(2).click();
    fixture.detectChanges();
    secondRow = componentEl.querySelector('table tbody tr:nth-child(2)');
    expect(secondRow?.querySelector('app-people-form')).toBeDefined();


    //without collapsing the edit, expand the country
    firstRowButtonList.item(1).click();
    fixture.detectChanges();
    secondRow = componentEl.querySelector('table tbody tr:nth-child(2)');
    expect(secondRow?.querySelector('app-people-form')).toBeNull();
    expect(secondRow?.querySelector('panemu-table')).toBeDefined();

    //click the delete button
    firstRowButtonList.item(3).click();
    fixture.detectChanges();
    secondRow = componentEl.querySelector('table tbody tr:nth-child(2)');
    expect(secondRow?.textContent?.trim().startsWith('Are you sure')).toBeTrue();
  });
});
