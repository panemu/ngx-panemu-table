import { Component, inject, OnInit, signal } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { CellEditorRenderer, ColumnType, PanemuSettingComponent, PanemuTableComponent, PanemuTableController, PanemuTableDataSource, PanemuTableEditingController, PanemuTableService, PropertyColumn, RetrieveDataFunction, TABLE_MODE, TableQuery } from 'ngx-panemu-table';
import { delay, map, Observable, of } from 'rxjs';
import { DataService } from '../../service/data.service';
import { ToolbarComponent } from './toolbar.component';
import { AddressCellEditor } from './address-cell-editor';
import { SampleEditingController } from './sample-editing-controller';
import { DocumentationService } from '../documentation.service';

const DATA = [
  { id: 1, name: "Abagail Kingscote", address: { street: 'Jl. Panemu', zipCode: '55652' } },
  { id: 2, name: "Nicolina Coit", address: { street: 'Yogyakarta', zipCode: '55672' } },
  { id: 3, name: "Sarene Greim" },
  { id: 4, name: "Blair Millbank", address: {} },
  { id: 5, name: "Kliment Sprowle", address: { street: 'Margosari', zipCode: '55651' } },
]

class EditingController extends SampleEditingController<any> {
  constructor(private datasource: PanemuTableDataSource<any>, docService: DocumentationService) {
    super(docService)
  }

  form: { [f : string]: () => AbstractControl | undefined } = {
    id: () => undefined,
    name: () => new FormControl('', { updateOn: 'blur', validators: [Validators.required, Validators.maxLength(15), Validators.minLength(5)] }),
    address: () => new FormGroup(
      {
        street: new FormControl('', { validators: [Validators.maxLength(50)] }),
        zipCode: new FormControl('', { validators: [Validators.maxLength(5), Validators.minLength(5)] })
      },
      { validators: this.addressValidator() }
    )
  }

  private addressValidator(): ValidatorFn {
    return (form): ValidationErrors | null => {
      let objectValue = form.getRawValue();
      if (objectValue['street'] || objectValue['zipCode']) {
        if (!objectValue['street'] || !objectValue['zipCode']) {
          return { error: 'If Street or Address has value, both should have value' }
        }
      }
      return null;
    }
  }

  override initCellEditorRenderer(renderer: CellEditorRenderer<any>, column: PropertyColumn<any>): CellEditorRenderer<any> {
    if (renderer.field == 'address') {
      renderer.component = AddressCellEditor
    }
    return renderer;
  }

  override createFormControl(field: keyof any, rowData: any, tableMode: TABLE_MODE): AbstractControl | null | undefined {
    return this.form[field.toString()]?.();
  }

  override saveData(data: any[], tableMode: TABLE_MODE): Observable<any[]> {
    this.dummySave(data, tableMode, this.datasource)
    return of(data).pipe(delay(1000));
  }

  override deleteData(data: any): Observable<any> {
    this.dummyDelete(data, this.datasource);
    return of({}).pipe(delay(1000));
  }
}

@Component({
    selector: 'inline-editing2',
    imports: [PanemuTableComponent, ToolbarComponent],
    template: `
	<div class="border">
    <div>
      <toolbar-component [controller]="controller">
        <button class="toolbar-button" (click)="resetData()">Reset Data</button>
      </toolbar-component>
    </div>
    <panemu-table [controller]="controller"/>
  </div>
	`
})

export class InlineEditing2Component implements OnInit {
  pts = inject(PanemuTableService);
  dataService = inject(DataService);

  columns = this.pts.buildColumns<any>([
    { field: 'id', type: ColumnType.INT },
    { field: 'name' },
    {
      field: 'address', formatter: (val: any, rowData?: any) => {

        return (rowData['address']?.['street'] ?? '') + ' ' + (rowData['address']?.['zipCode'] ?? '')
      }
    },

  ])

  datasource = new PanemuTableDataSource<any>(JSON.parse(JSON.stringify(DATA)));

  retrieveDataFunction: RetrieveDataFunction<any> = (startIndex: number, maxRows: number, tableQuery: TableQuery) => {
    return this.datasource.getData(startIndex, maxRows, tableQuery).pipe(
      map(data => JSON.parse(JSON.stringify(data)))
    )
  }
  controller = PanemuTableController.createWithCustomDataSource<any>(this.columns, this.retrieveDataFunction, {
    autoHeight: true
  });

  resetData() {
    this.datasource.setData(JSON.parse(JSON.stringify(DATA)));
    this.controller.reloadData();
  }

  docService = inject(DocumentationService);

  ngOnInit() {
    let editingController = new EditingController(this.datasource, this.docService);
    this.controller.editingController = editingController;
    this.controller.reloadData();
  }

}

