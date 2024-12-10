import { Component, inject, OnInit, signal, TemplateRef, viewChild } from '@angular/core';
import { ColumnType, DefaultCellRenderer, PanemuPaginationComponent, PanemuQueryComponent, PanemuTableComponent, PanemuTableController, PanemuTableService, RowGroup, TableQuery } from 'ngx-panemu-table';
import { People } from '../model/people';
import { DataService } from '../service/data.service';
import { tap } from 'rxjs';
import { CountryCode } from '../model/country-code';
import { CellFormatterPipe } from '../../../../ngx-panemu-table/src/public-api';

@Component({
  templateUrl: 'all-features-server.component.html',
  imports: [PanemuTableComponent, PanemuPaginationComponent, PanemuQueryComponent, CellFormatterPipe],
  standalone: true,
})

export class AllFeaturesServerComponent implements OnInit {
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

  startIndex = 0;
  maxRows = 0;
  tableQuery?: string;
  resultRowType?: string;
  resultCount?: number;
  private dataService = inject(DataService);

  ngOnInit() {
    const map: any = {}
    CountryCode.forEach(item => map[item.code] = item.name);
    this.countryMap.set(map);
    this.controller.reloadData()
  }

  private retrieveData(startIndex: number, maxRows: number, tableQuery: TableQuery) {
    
    this.displayQueryInfo(startIndex, maxRows, tableQuery)
    
    return this.dataService.getMockedServerData(startIndex, maxRows, tableQuery).pipe(
      tap(result => {
        const firstRow: any = result.rows?.[0];
        if (firstRow?.count && firstRow?.value) {
          this.resultRowType = 'RowGroup'
        } else {
          this.resultRowType = 'People'
        }
        this.resultCount = result.totalRows;
      })
    )
  }

  private displayQueryInfo(startIndex: number, maxRows: number, tableQuery: TableQuery) {
    this.startIndex = startIndex;
    this.maxRows = maxRows;
    let cloneTableQuery: Partial<TableQuery> = JSON.parse(JSON.stringify(tableQuery));

    if (!cloneTableQuery.groupBy) {
      delete cloneTableQuery.groupBy;
    }

    if (!cloneTableQuery.sortingInfos?.length) {
      delete cloneTableQuery.sortingInfos;
    }
    if (!cloneTableQuery.sortingInfos?.length) {
      delete cloneTableQuery.sortingInfos;
    }

    if (!cloneTableQuery.tableCriteria?.length) {
      delete cloneTableQuery.tableCriteria;
    }
    delete cloneTableQuery.utcMinuteOffset;

    this.tableQuery = JSON.stringify(cloneTableQuery);
  }
}