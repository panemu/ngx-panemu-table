import { ComponentFixture, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { BasicComponent } from './basic.component';
import { DebugElement } from '@angular/core';
import { People } from '../model/people';

//ng test demo --include="projects/demo/src/app/example/basic.component.spec.ts"

describe('BasicComponent', () => {
  let component: BasicComponent;
  let fixture: ComponentFixture<BasicComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({imports: [BasicComponent]}).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BasicComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeDefined();
  });
  
  it('row selection', async () => {
    await fixture.whenStable(); //wait for controller.reloadData()
    
    let selectedRow = component.controller.getSelectedRow();
    expect(selectedRow).toBeFalsy(); //initially no row selected

    //========= select first row
    component.controller.selectFirst();
    fixture.detectChanges();
    selectedRow = component.controller.getSelectedRow();
    expect(selectedRow).toBeTruthy();

    console.log('selected row', selectedRow);

    const componentDe: DebugElement = fixture.debugElement;
    const componentEl: HTMLElement = componentDe.nativeElement;

    let selectedTr = componentEl.querySelector('table tr.selected-row td:nth-child(2)')
    console.log(`textContent ${selectedTr?.textContent}`)
    
    expect(selectedTr?.textContent?.trim()).toBe((component.controller.getData()[0] as People).name);
    
    //======== select third row
    const rowIdx = 2;
    component.controller.selectRow(rowIdx);
    fixture.detectChanges();
    let lstTr = componentEl.querySelectorAll('table tbody tr')
    console.log(`lstTr size`, lstTr.length)
    console.log(`class list ${lstTr[rowIdx].classList}`);
    expect(lstTr[rowIdx].classList.contains('selected-row')).toBe(true);
    

    //======== clear selection
    component.controller.clearSelection();
    expect(component.controller.getSelectedRow()).toBeFalsy();
    fixture.detectChanges();
    selectedTr = componentEl.querySelector('table tbody tr.selected-row');
    expect(selectedTr).toBe(null);
    
  });
})