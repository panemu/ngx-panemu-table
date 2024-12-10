import { provideHttpClient } from '@angular/common/http';
import { DebugElement } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { AllFeaturesClientComponent } from './all-features-client.component';

//ng test demo --include="projects/demo/src/app/example/all-features-client.component.spec.ts"

describe('AllFeaturesClientComponent', () => {
  let component: AllFeaturesClientComponent;
  let fixture: ComponentFixture<AllFeaturesClientComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [AllFeaturesClientComponent],
      providers: [provideHttpClient()]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AllFeaturesClientComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeDefined();
  });

  it('should has data', async () => {
    await fixture.whenStable();
    const data = [...component.datasource.getAllData()];
    expect(data?.length).toBeTruthy();

    fixture.detectChanges();//render the UI

    //======== Check initial grouping and filtering
    const de: DebugElement = fixture.debugElement;
    const componentEl: HTMLElement = de.nativeElement;
    let groupChip = componentEl.querySelector('.panemu-query .group .chip-label');
    const filterChip = componentEl.querySelector('.panemu-query .filter .chip-label');


    expect(groupChip?.textContent).toBe('Country');
    expect(filterChip?.textContent).toBe('true');
    const countries = new Set(data.filter(item => item.verified).map(item => item.country));
    expect(component.controller.getAllData().length).toBe(countries.size);

    //=== Remove grouping
    const button = componentEl.querySelector('.panemu-query .group.chip-panel button') as HTMLElement;
    button!.click();
    fixture.detectChanges();

    //group chip should be gone
    groupChip = componentEl.querySelector('.panemu-query .group .chip-label');
    expect(groupChip).toBeFalsy();

    //displayed data should be 100
    expect(component.controller.getAllData().length).toBe(100);
    expect(componentEl.querySelectorAll('table tbody tr').length).toBe(100);
  })

  it('pagination on row group should works', async () => {

    const oriMaxRows = component.controller.maxRows;
    const paginationSize = 5;
    component.controller.maxRows = paginationSize;
    component.controller.criteria = [];
    component.controller.reloadData();
    await fixture.whenStable();
    fixture.detectChanges();

    //======== Check initial grouping and filtering
    const de: DebugElement = fixture.debugElement;
    const componentEl: HTMLElement = de.nativeElement;
    let firstCell = componentEl.querySelector('tbody tr td');
    let groupLabelEl = firstCell?.querySelector('.group-label') as HTMLElement;
    const philippinesCount = 13;
    expect(groupLabelEl?.textContent).toBe(`Philippines (${philippinesCount})`);
    groupLabelEl.click();
    fixture.detectChanges();
    await fixture.whenStable();

    let paginationEl = firstCell?.querySelector('panemu-pagination');
    expect(paginationEl).toBeDefined();

    const expandedRowsEl = componentEl.querySelectorAll('tbody tr.row');
    expect(expandedRowsEl.length).toBe(paginationSize);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(paginationEl!.querySelector('span')?.textContent?.trim()).toBe(`/ ${philippinesCount}`);
    const inputEl = paginationEl!.querySelector('input') as HTMLInputElement;
    expect(inputEl.value).toBe('1-5');
    component.controller.maxRows = oriMaxRows;
  })

  it('2 level grouping. first level with month modifier', async () => {
    component.controller.criteria = [];
    component.controller.groupByColumns = [{ field: 'enrolled', modifier: 'month' }, { field: 'gender' }];
    component.controller.reloadData();
    await fixture.whenStable();
    fixture.detectChanges();

    //expand 
    const de: DebugElement = fixture.debugElement;
    const componentEl: HTMLElement = de.nativeElement;
    let firstCell = componentEl.querySelector('tbody tr td');
    let groupLabelEl = firstCell?.querySelector('.group-label') as HTMLElement;
    groupLabelEl.click();
    fixture.detectChanges();
    await fixture.whenStable();

    let allRows = componentEl.querySelectorAll('tbody tr');
    let secondRowCellExpander = allRows[1].querySelector('td .group-label') as HTMLElement;
    secondRowCellExpander?.click();
    fixture.detectChanges();
    await fixture.whenStable();
    allRows = componentEl.querySelectorAll('tbody tr') as NodeListOf<HTMLElement>;

    let firstRowData = 2;
    let lastRowData = -1;
    for (let index = firstRowData; index < allRows.length; index++) {
      const tr = allRows[index];
      const rowGroupLabel = tr.querySelector('td .group-label');

      if (rowGroupLabel) {
        lastRowData = index;
        break;
      }
    }

    const count = lastRowData - firstRowData;
    expect(count).toBe(12); //Apr 2023 - Female should be 12
  })
})