import { Component, inject, OnInit, signal, TemplateRef, viewChild } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ColumnType, DefaultCellRenderer, PanemuTableComponent, PanemuTableController, PanemuTableService, TableQuery } from 'ngx-panemu-table';
import { throwError } from 'rxjs';
import { CountryCode } from '../../model/country-code';
import { People } from '../../model/people';
import { CustomPanemuTableService } from '../../service/custom-panemu-table.service';
import { DataService } from '../../service/data.service';

@Component({
  templateUrl: 'error-handling-sample.component.html',
  imports: [PanemuTableComponent, ReactiveFormsModule],
  standalone: true,
  providers: [
    {provide: PanemuTableService, useClass: CustomPanemuTableService}
  ]
})

export class ErrorHandlingSample implements OnInit {
private pts = inject(PanemuTableService)
  cmbErrorHandler = new FormControl('controller')
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
  controller = PanemuTableController.createWithCustomDataSource<People>(
    this.columns, 
    this.retrieveData.bind(this),
    {
      errorHandler: (err) => {
        this.handlerError(err)
      }
    }
  );

  startIndex = 0;
  maxRows = 0;
  tableQuery?: string;
  resultRowType?: string;
  resultCount?: number;
  counter = signal(0)
  loading = toSignal(this.controller.loading)
  private dataService = inject(DataService);

  constructor() {
    this.cmbErrorHandler.valueChanges.subscribe({
      next: val => {
        if (val == 'pts') {
          this.controller.errorHandler = null; //fallback to pts.handleError
        } else {
          this.controller.errorHandler = this.handlerError.bind(this)
        }
      }
    })
  }

  ngOnInit() {
    const map: any = {}
    CountryCode.forEach(item => map[item.code] = item.name);
    this.countryMap.set(map);
    this.controller.reloadData()
  }

  private retrieveData(startIndex: number, maxRows: number, tableQuery: TableQuery) {
    this.counter.update(val => val + 1)
    if (this.counter() % 2 == 0) {
      return throwError(() => new Error("This is a sample error"))
    }
    return this.dataService.getMockedServerData(startIndex, maxRows, tableQuery)
  }

  reload() {
    this.controller.reloadData()
  }

  handlerError(err: any) {
    console.log('counter', this.counter())
    alert(`This error is handled locally.\n\n${err}\n\nReload counter: ${this.counter()}`)
  }
}