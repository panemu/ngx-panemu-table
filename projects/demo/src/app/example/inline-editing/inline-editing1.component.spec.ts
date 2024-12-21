import { provideHttpClient } from '@angular/common/http';
import { DebugElement } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { InlineEditing1Component } from './inline-editing1.component';
import { of } from 'rxjs';

//ng test demo --include="projects/demo/src/app/example/inline-editing/inline-editing1.component.spec.ts"
describe('InlineEditing1Component', () => {
  let component: InlineEditing1Component;
  let fixture: ComponentFixture<InlineEditing1Component>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [InlineEditing1Component],
      providers: [provideHttpClient()]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InlineEditing1Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeDefined();
  });
  
  it('insert and cancel', async () => {
    await fixture.whenStable();
    fixture.detectChanges();
    const de: DebugElement = fixture.debugElement;
    const componentEl: HTMLElement = de.nativeElement;

    const btnReload = componentEl.querySelector('button[data-test-id="btnReload"]') as HTMLButtonElement;
    const btnInsert = componentEl.querySelector('button[data-test-id="btnInsert"]') as HTMLButtonElement;
    const btnEdit = componentEl.querySelector('button[data-test-id="btnEdit"]') as HTMLButtonElement;
    const btnSave = componentEl.querySelector('button[data-test-id="btnSave"]') as HTMLButtonElement;
    const btnDelete = componentEl.querySelector('button[data-test-id="btnDelete"]') as HTMLButtonElement;
    const btnExport = componentEl.querySelector('button[data-test-id="btnExport"]') as HTMLButtonElement;

    expect(btnInsert.disabled).toBeFalse();
    expect(btnSave.disabled).toBeTrue();
    expect(btnDelete.disabled).toBeTrue();

    let lstTr = componentEl.querySelectorAll('table tbody tr');
    expect(lstTr.length).toBe(5);
    btnInsert.click();
    btnInsert.click();
    btnInsert.click();
    fixture.detectChanges();
    expect(btnEdit.disabled).toBeTrue();
    expect(btnSave.disabled).toBeFalse();

    lstTr = componentEl.querySelectorAll('table tbody tr');
    expect(lstTr.length).toBe(8);
    
    let selectedTr = componentEl.querySelector('table tr.selected-row') as HTMLTableRowElement;
    
    let lstInput = selectedTr.querySelectorAll('input');
    let lstSelect = selectedTr.querySelectorAll('select');
    expect(lstInput.length).toBe(6);
    expect(lstSelect.length).toBe(2);

    spyOn(component.controller.editingController!, 'canReload').and.resolveTo(true);
    btnReload.click();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(component.controller.editingController!.canReload).toHaveBeenCalled();
    expect(btnEdit.disabled).toBeFalse();
    expect(btnSave.disabled).toBeTrue();
    lstTr = componentEl.querySelectorAll('table tbody tr');
    expect(lstTr.length).toBe(5);
  });

  it('insert validation error', async () => {
    await fixture.whenStable();
    fixture.detectChanges();
    const de: DebugElement = fixture.debugElement;
    const componentEl: HTMLElement = de.nativeElement;
    component.controller.insert();
    fixture.detectChanges();

    spyOn(component.controller.editingController!, 'showValidationError');

    component.controller.save();
    // await fixture.whenStable();
    // fixture.detectChanges();
    let valError = { name: 'This field is required', country: 'This field is required' };
    expect(component.controller.editingController!.showValidationError).toHaveBeenCalledWith(valError, jasmine.anything());
  });

  it('insert save ok', async () => {
    await fixture.whenStable();
    fixture.detectChanges();
    const de: DebugElement = fixture.debugElement;
    const componentEl: HTMLElement = de.nativeElement;
    let rowData = {name: 'John Doe', country: 'ID'};

    spyOn(component.controller.editingController!, 'createNewRowData').and.returnValue(rowData);
    component.controller.insert();
    fixture.detectChanges();

    spyOn(component.controller.editingController!, 'showValidationError');
    spyOn(component.controller.editingController!, 'saveData').and.returnValue(of([rowData]));
    component.controller.save();
    await fixture.whenStable();
    fixture.detectChanges();
    
    expect(component.controller.editingController!.showValidationError).not.toHaveBeenCalled();
    expect(component.controller.editingController!.saveData).toHaveBeenCalledWith([rowData], 'insert');
  });

  //test click on edit button
  it('edit', async () => {
    await fixture.whenStable();
    fixture.detectChanges();
    const de: DebugElement = fixture.debugElement;
    const componentEl: HTMLElement = de.nativeElement;
    const btnReload = componentEl.querySelector('button[data-test-id="btnReload"]') as HTMLButtonElement;
    const btnInsert = componentEl.querySelector('button[data-test-id="btnInsert"]') as HTMLButtonElement;
    const btnEdit = componentEl.querySelector('button[data-test-id="btnEdit"]') as HTMLButtonElement;
    const btnSave = componentEl.querySelector('button[data-test-id="btnSave"]') as HTMLButtonElement;
    const btnDelete = componentEl.querySelector('button[data-test-id="btnDelete"]') as HTMLButtonElement;
    const btnExport = componentEl.querySelector('button[data-test-id="btnExport"]') as HTMLButtonElement;

    expect(btnInsert.disabled).toBeFalse();
    expect(btnSave.disabled).toBeTrue();
    expect(btnDelete.disabled).toBeTrue();

    let lstTr = componentEl.querySelectorAll('table tbody tr');
    expect(lstTr.length).toBe(5);
    btnEdit.click();
    fixture.detectChanges();
    expect(btnSave.disabled).toBeFalse();
    expect(btnDelete.disabled).toBeTrue();

    //find first row in table body then click it
    lstTr = componentEl.querySelectorAll('table tbody tr');
    expect(lstTr.length).toBe(5);
    (lstTr[0] as HTMLTableRowElement).click();
    fixture.detectChanges();
    

    //select the first row then assert cell editors are displayed
    let selectedTr = componentEl.querySelector('table tr.selected-row') as HTMLTableRowElement;
    let lstInput = selectedTr.querySelectorAll('input');
    let lstSelect = selectedTr.querySelectorAll('select');
    expect(lstInput.length).toBe(6);
    expect(lstSelect.length).toBe(2);

    //fill in proper values to the input elements above
    lstInput[1].value = 'test@email.com';
    lstSelect[0].value = 'M';
    lstSelect[1].value = 'ID';

    //click save
    btnSave.click();
    fixture.detectChanges();
    expect(btnSave.disabled).toBeTrue();
    expect(btnDelete.disabled).toBeFalse();
  });

})