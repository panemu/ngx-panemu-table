import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';

import { VirtualScrollComponent } from './virtual-scroll.component';
import { DebugElement } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';

// ng test demo --include="projects/demo/src/app/example/virtual-scroll.component.spec.ts"

describe('VirtualScrollComponent', () => {
  let component: VirtualScrollComponent;
  let fixture: ComponentFixture<VirtualScrollComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VirtualScrollComponent],
      providers: [provideHttpClient()]
    })
      .compileComponents();

    fixture = TestBed.createComponent(VirtualScrollComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });


  it('row count is way less than data count', async () => {
    await fixture.whenStable();
    fixture.detectChanges();
    const dataCount = component.controller.getData().length;
    expect(dataCount).toBe(10000);

    const de: DebugElement = fixture.debugElement;
    const componentEl: HTMLElement = de.nativeElement;

    const dataRows = componentEl.querySelectorAll('tbody tr') as NodeListOf<HTMLInputElement>;
    console.log(dataRows.length);

    expect(dataRows.length).toBeLessThan(dataCount / 10);
  });

  it('row group pagination repaint', async () => {
    component.controller.groupByColumns = [{ field: 'country' }];
    component.controller.reloadData();
    await fixture.whenStable();
    fixture.detectChanges();

    const de: DebugElement = fixture.debugElement;
    const componentEl: HTMLElement = de.nativeElement;

    let firstCell = componentEl.querySelector('tbody tr td');
    let groupLabelEl = firstCell?.querySelector('.group-label') as HTMLElement;

    groupLabelEl.click(); // expand group
    fixture.detectChanges();
    await fixture.whenStable();
    let paginationEl = firstCell?.querySelector('panemu-pagination');
    expect(paginationEl).toBeDefined();

    const inputEl = paginationEl!.querySelector('input') as HTMLInputElement;
    expect(inputEl.value).toBe('1-40');

    const btnDown = componentEl.querySelector('button[data-test-id="btn-down"]') as HTMLElement;
    btnDown.click();
    
    await fixture.whenStable();
    fixture.detectChanges();
    fixture.detectChanges();
    console.log('abc')

    // const btnUp = componentEl.querySelector('button[data-test-id="btn-up"]') as HTMLElement;
    // btnUp.click();
    // fixture.detectChanges();
    // await fixture.whenStable();

    console.log('def')
    // await fixture.whenStable();
    // fixture.detectChanges();


  });
});
