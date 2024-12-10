import { Component, inject, OnInit, signal, TemplateRef, viewChild } from '@angular/core';
import { CellFormatterPipe, ColumnType, DefaultCellRenderer, PanemuPaginationComponent, PanemuQueryComponent, PanemuTableComponent, PanemuTableController, PanemuTableService, TABLE_MODE, TableQuery } from 'ngx-panemu-table';
import { CountryCode } from '../../model/country-code';
import { People } from '../../model/people';
import { DataService } from '../../service/data.service';
import { ToolbarComponent } from './toolbar.component';
import { SampleEditingController } from './sample-editing-controller';
import { DocumentationService } from '../documentation.service';
import { AbstractControl, FormControl, Validators } from '@angular/forms';
import { Observable, of } from 'rxjs';

class EditingController extends SampleEditingController<People> {
  form: {[f in keyof Required<People>]: () => FormControl | null} = {
    id: () => null,
    name: () => new FormControl('', [Validators.required, Validators.maxLength(50)]),
    email: () => new FormControl('', [Validators.email]),
    gender: () => new FormControl(''),
    enrolled: () => new FormControl(''),
    country: () => new FormControl(''),
    amount: () => new FormControl(''),
    last_login: () => new FormControl(''),
    verified: () => new FormControl(''),
  }

  override createFormControl(field: keyof People, rowData: People, tableMode: TABLE_MODE): AbstractControl | null | undefined {
    return this.form[field]()
  }

  override saveData(data: People[], tableMode: TABLE_MODE): Observable<People[]> {
      return of(data)
  }

  override afterSuccessfulSave(data: People[], tableMode: TABLE_MODE): void {
    alert(`${data.length} data have been saved`)
  }

  override deleteData(data: People): Observable<any> {
    return of({})
  }

  override afterSuccessfulDelete(serverData: unknown): void {
    alert('Delete successful')
  }
}

@Component({
  templateUrl: 'inline-editing7.component.html',
  imports: [PanemuTableComponent, PanemuPaginationComponent, PanemuQueryComponent, CellFormatterPipe, ToolbarComponent],
  standalone: true,
})

export class InlineEditing7Component implements OnInit {
  private pts = inject(PanemuTableService)
  countryMap = signal({});
  countryCell = viewChild<TemplateRef<any>>('countryCell')
  columns = this.pts.buildColumns<People>([
    { field: 'id', type: ColumnType.INT},
    { field: 'name' },
    { field: 'email' },
    { field: 'gender', type: ColumnType.MAP, valueMap: { F: "Female", M: "Male" } },
    { field: 'country', type: ColumnType.MAP, valueMap :  this.countryMap, cellRenderer: DefaultCellRenderer.create(this.countryCell)},
    { field: 'amount', type: ColumnType.DECIMAL },
    { field: 'enrolled', type: ColumnType.DATE },
    { field: 'last_login', type: ColumnType.DATETIME },
    { field: 'verified', type: ColumnType.MAP, valueMap: {true: 'Yes', false: 'No'}}
  ])
  controller = PanemuTableController.createWithCustomDataSource<People>(this.columns, this.retrieveData.bind(this));
  docService = inject(DocumentationService);

  private dataService = inject(DataService);

  ngOnInit() {
    this.controller.editingController = new EditingController(this.docService)
    const map: any = {}
    CountryCode.forEach(item => map[item.code] = item.name);
    this.countryMap.set(map);
    this.controller.reloadData()
  }

  private retrieveData(startIndex: number, maxRows: number, tableQuery: TableQuery) {
    return this.dataService.getMockedServerData(startIndex, maxRows, tableQuery)
  }

  
}