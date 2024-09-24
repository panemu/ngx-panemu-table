import { ComponentFixture, fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { DebugElement } from '@angular/core';
import { MapColumnComponent } from './map-column.component';

//ng test demo --include="projects/demo/src/app/doc/columns/map-column/map-column.component.spec.ts"

describe('MapColumnComponent', () => {
  let component: MapColumnComponent;
  let fixture: ComponentFixture<MapColumnComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({imports: [MapColumnComponent]}).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MapColumnComponent);
    component = fixture.componentInstance;
    
  });

  it('should create', () => {
    expect(component).toBeDefined();
  });
  
  it('change value map', fakeAsync( () => {
    fixture.detectChanges();
    tick(2000);
    fixture.detectChanges();
    expect(component).toBeDefined();
    const de: DebugElement = fixture.debugElement;
    const componentEl: HTMLElement = de.nativeElement;
    let firstRowTd = componentEl.querySelectorAll('tbody tr td') as NodeListOf<HTMLElement>;
    expect(firstRowTd[0].textContent?.trim()).toBe('F');
    expect(firstRowTd[1].textContent?.trim()).toBe('Female');
    expect(firstRowTd[2].textContent?.trim()).toBe('Girl');
    
    const btn1 = componentEl.querySelector('button[data-test-id="btn1"]') as HTMLElement;
    const btn2 = componentEl.querySelector('button[data-test-id="btn2"]') as HTMLElement;
    
    btn2.click();
    fixture.detectChanges();

    firstRowTd = componentEl.querySelectorAll('tbody tr td') as NodeListOf<HTMLElement>;
    expect(firstRowTd[0].textContent?.trim()).toBe('F');
    expect(firstRowTd[1].textContent?.trim()).toBe('Female');
    expect(firstRowTd[2].textContent?.trim()).toBe('Woman');

    btn1.click();
    fixture.detectChanges();

    firstRowTd = componentEl.querySelectorAll('tbody tr td') as NodeListOf<HTMLElement>;
    expect(firstRowTd[0].textContent?.trim()).toBe('F');
    expect(firstRowTd[1].textContent?.trim()).toBe('Female');
    expect(firstRowTd[2].textContent?.trim()).toBe('Girl');
  }));
})