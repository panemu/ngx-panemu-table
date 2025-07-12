import { Component, inject, OnInit, signal, TemplateRef, viewChild } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ColumnType, DefaultCellRenderer, PanemuTableComponent, PanemuTableController, PanemuTableService, TableQuery } from 'ngx-panemu-table';
import { throwError } from 'rxjs';
import { CountryCode } from '../../model/country-code';
import { People } from '../../model/people';
import { CustomPanemuTableService } from '../../service/custom-panemu-table.service';
import { DataService } from '../../service/data.service';
import { DocumentationService } from '../documentation.service';

@Component({
    templateUrl: 'error-handling-sample.component.html',
    imports: [PanemuTableComponent, ReactiveFormsModule],
    providers: [
        /**
         * To apply custom injection globally, set this provider in angular
         * app.config.ts
         *
         * @see https://ngx-panemu-table.panemu.com/getting-started/configuration
         */
        {
            provide: PanemuTableService, useClass: CustomPanemuTableService
        }
    ]
})

export class ErrorHandlingSample implements OnInit {
private pts = inject(PanemuTableService)
  cmbErrorHandler = new FormControl('controller')
  countryMap = signal({});
  columns = this.pts.buildColumns<People>([
    { field: 'id', type: ColumnType.INT},
    { field: 'name' },
    { field: 'email' },
    { field: 'gender', type: ColumnType.MAP, valueMap: { F: "Female", M: "Male" } },
    { field: 'country', type: ColumnType.MAP, valueMap :  this.countryMap},
    { field: 'amount', type: ColumnType.DECIMAL },
    { field: 'enrolled', type: ColumnType.DATE },
    { field: 'last_login', type: ColumnType.DATETIME },
    { field: 'verified', type: ColumnType.MAP, valueMap: {true: 'Yes', false: 'No'}}
  ])
  controller = PanemuTableController.createWithCustomDataSource<People>(
    this.columns, 
    this.retrieveData.bind(this),
    {
      //Override global error handler
      errorHandler: this.handlerError.bind(this)
    }
  );

  startIndex = 0;
  maxRows = 0;
  tableQuery?: string;
  resultRowType?: string;
  resultCount?: number;
  counter = signal(0)
  loading = toSignal(this.controller.loading)
  docService = inject(DocumentationService);
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
    this.docService.showDialog({
      title: 'Local Error Handler',
      content: err.message || err,
      yesLabel: 'Ok',
      noLabel: 'Reload Again?',
      type: 'confirm'
    }).then(answer => {
      if (answer == 'no') {
        this.reload();
      }
    })
  }
}