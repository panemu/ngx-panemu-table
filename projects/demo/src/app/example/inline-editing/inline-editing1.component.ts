import { Component, inject, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { ColumnType, PanemuTableComponent, PanemuTableController, PanemuTableDataSource, PanemuTableService, RetrieveDataFunction, TABLE_MODE, TableQuery } from 'ngx-panemu-table';
import { delay, map, Observable, of, tap } from 'rxjs';
import { People } from '../../model/people';
import { DataService } from '../../service/data.service';
import { DocumentationService } from '../documentation.service';
import { SampleEditingController } from './sample-editing-controller';
import { ToolbarComponent } from './toolbar.component';

const DATA: People[] = [
  { id: 1, name: "Abagail Kingscote", email: '' },
  { id: 2, name: "Nicolina Coit", email: "ncoit1@vk.com", gender: "M", enrolled: "2023-11-01", country: "KZ", amount: 3744.95, last_login: "2024-04-29 12:48:59", verified: false },
  { id: 3, name: "Sarene Greim", email: "sgreim2@seesaa.net", gender: "M", enrolled: "2023-01-03", country: null, amount: 4397.68, last_login: "2024-06-03 13:14:23", verified: true },
  { id: 4, name: "Blair Millbank", gender: "F", enrolled: undefined, country: "CH", last_login: "2024-06-18 12:06:58", verified: false },
  { id: 5, name: "Kliment Sprowle", email: "ksprowle4@alexa.com", gender: "M", enrolled: "2023-12-25", country: "ID", amount: 6459.93, last_login: "2024-04-24 03:46:26", verified: true },
]

class EditingController extends SampleEditingController<People> {

  constructor(private datasource: PanemuTableDataSource<People>, docService: DocumentationService) {
    super(docService)
  }

  getNewRowId?: () => number;

  form: { [f in keyof Required<People>]: () => FormControl | undefined } = {
    id: () => undefined,
    name: () => new FormControl('', { updateOn: 'blur', validators: [Validators.required, Validators.maxLength(50), Validators.minLength(3)] }),
    email: () => new FormControl('', { updateOn: 'blur', validators: [Validators.email] }),
    gender: () => new FormControl('', { updateOn: 'blur' }),
    enrolled: () => new FormControl('', { updateOn: 'blur' }),
    country: () => new FormControl('', { updateOn: 'blur', validators: [Validators.required] }),
    amount: () => new FormControl('', { validators: [Validators.max(10000), Validators.min(1000)] }),
    last_login: () => new FormControl('', { updateOn: 'blur' }),
    verified: () => new FormControl('', { updateOn: 'blur' })
  }

  override createNewRowData(): Partial<People> {
    return { id: this.getNewRowId?.() || 0 }
  }

  override onCommitEdit(field: keyof People, value: any, previousValue: any, rowData: People, formControl: FormControl): void {
    console.log('on commit edit. field', field, 'value', value, 'prev value', previousValue);
    console.log(formControl.errors)

    super.onCommitEdit(field, value, previousValue, rowData, formControl);
  }

  override createFormControl(field: keyof People, rowData: People, tableMode: TABLE_MODE): FormControl | null | undefined {
    return this.form[field]();
  }

  override saveData(data: People[], tableMode: TABLE_MODE): Observable<People[]> {
    /**
     * This logic is only for demo purpose. It should call real api to save data.
     */

    data.forEach(item => {
      item.last_login = this.getCurrentLocalDateTime();
    })

    this.dummySave(data, tableMode, this.datasource);

    return of(data).pipe(
      delay(1000)
    );
  }

  override deleteData(data: People): Observable<any> {
    this.dummyDelete(data, this.datasource)
    return of({}).pipe(delay(1000));
  }
}

@Component({
  standalone: true,
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
  `,
})
export class InlineEditing1Component implements OnInit {
  pts = inject(PanemuTableService);
  dataService = inject(DataService);

  columns = this.pts.buildColumns<People>([
    { field: 'id', type: ColumnType.INT },
    { field: 'name' },
    { field: 'email' },
    { field: 'gender', type: ColumnType.MAP, valueMap: { F: 'Female', M: 'Male' } },
    { field: 'country', type: ColumnType.MAP, valueMap: this.dataService.getCountryMap() },
    { field: 'amount', type: ColumnType.DECIMAL },
    {
      type: ColumnType.GROUP, label: 'Date Info', children: [
        { field: 'enrolled', type: ColumnType.DATE, label: 'Updated On' },
        { field: 'last_login', type: ColumnType.DATETIME },
      ]
    },
    { field: 'verified' }
  ])
  docService = inject(DocumentationService);

  datasource = new PanemuTableDataSource<People>(JSON.parse(JSON.stringify(DATA)));

  retrieveDataFunction: RetrieveDataFunction<People> = (startIndex: number, maxRows: number, tableQuery: TableQuery) => {
    return this.datasource.getData(startIndex, maxRows, tableQuery).pipe(
      map(data => JSON.parse(JSON.stringify(data)))
    )
  }
  controller = PanemuTableController.createWithCustomDataSource<People>(this.columns, this.retrieveDataFunction, {
    autoHeight: true
  });

  resetData() {
    this.datasource.setData(JSON.parse(JSON.stringify(DATA)));
    this.controller.reloadData();
  }

  ngOnInit() {
    let editingController = new EditingController(this.datasource, this.docService);
    editingController.getNewRowId = () => this.controller.getData().length + 1;
    this.controller.editingController = editingController;
    this.controller.reloadData();
  }

}

