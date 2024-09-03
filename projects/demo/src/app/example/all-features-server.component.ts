import { Component, OnInit } from '@angular/core';
import { ColumnType, PanemuPaginationComponent, PanemuQueryComponent, PanemuTableComponent, PanemuTableController, PanemuTableService, RowGroup, TableQuery } from 'ngx-panemu-table';
import { People } from '../model/people';
import { DataService } from '../service/data.service';
import { tap } from 'rxjs';

@Component({
  templateUrl: 'all-features-server.component.html',
  imports: [PanemuTableComponent, PanemuPaginationComponent, PanemuQueryComponent],
  standalone: true,
})

export class AllFeaturesServerComponent implements OnInit {
  columns = this.pts.buildColumns<People>([
    { field: 'id', type: ColumnType.INT },
    { field: 'name' },
    { field: 'email' },
    { field: 'gender', type: ColumnType.MAP, valueMap: { F: "Female", M: "Male" } },
    { field: 'country' },
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
  constructor(private dataService: DataService, private pts: PanemuTableService) { }

  ngOnInit() {
    this.controller.reloadData()
  }

  private retrieveData(startIndex: number, maxRows: number, tableQuery: TableQuery) {
    this.startIndex = startIndex;
    this.maxRows = maxRows;

    this.tableQuery = '';
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
}