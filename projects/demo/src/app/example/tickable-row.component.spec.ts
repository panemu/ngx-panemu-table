import { ComponentFixture, fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { TickableRowComponent } from './tickable-row.component';
import { provideHttpClient } from '@angular/common/http';
import { DebugElement } from '@angular/core';


//ng test demo --include="projects/demo/src/app/example/tickable-row.component.spec.ts"

describe('TickableRowComponent', () => {
  let component: TickableRowComponent;
  let fixture: ComponentFixture<TickableRowComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [TickableRowComponent],
      providers: [provideHttpClient()],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TickableRowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeDefined();
  });
  
  it('ticking rows', async () => {
    await fixture.whenStable();
    const data = [...component.datasource.getAllData()];
    expect(data?.length).toBeTruthy();
    
    fixture.detectChanges();//render the UI
    
    //======== Check initial grouping and filtering
    const de: DebugElement = fixture.debugElement;
    const componentEl: HTMLElement = de.nativeElement;
    const checkboxHeader = componentEl.querySelector('.panemu-table th input[type="checkbox"]') as HTMLInputElement;
    console.log('checkboxHeader value', checkboxHeader.checked)
    expect(checkboxHeader.checked).toBe(false);
    expect(checkboxHeader.indeterminate).toBe(false);
    expect(component.clmTick.getTickedRows().length).toBe(0);
    const tickCheckboxes = componentEl.querySelectorAll('.panemu-table .__tick_0_0 input') as NodeListOf<HTMLInputElement>;
    expect(tickCheckboxes.length).toBe(100);
    
    //========= tick first row programmatically
    let ds = component.datasource;
    component.clmTick.setTicked(true, ds.getAllData()[0]);
    fixture.detectChanges();
    await fixture.whenStable();
    
    expect(checkboxHeader.indeterminate).toBe(true);
    expect(component.clmTick.getTickedRows().length).toBe(1);
    expect(tickCheckboxes[0].checked).toBe(true);
    
    //======== tick first row manually
    tickCheckboxes[0].click();
    fixture.detectChanges();
    expect(component.clmTick.getTickedRows().length).toBe(0);
    
    //======= tick header to tick all
    checkboxHeader.click();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(component.clmTick.getTickedRows().length).toBe(100);
    tickCheckboxes.forEach(item => expect(item.checked).toBe(true));

    //======= tick header again to untick all
    checkboxHeader.click();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(component.clmTick.getTickedRows().length).toBe(0);
    tickCheckboxes.forEach(item => expect(item.checked).toBe(false));

    //=== tick all programmatically
    component.clmTick.setTickedAll(true);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(component.clmTick.getTickedRows().length).toBe(100);
    tickCheckboxes.forEach(item => expect(item.checked).toBe(true));

    //=== untick all programmatically
    component.clmTick.setTickedAll(false);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(component.clmTick.getTickedRows().length).toBe(0);
    tickCheckboxes.forEach(item => expect(item.checked).toBe(false));


  });
})