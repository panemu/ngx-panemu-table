import { Component, OnInit } from '@angular/core';
import { ColumnType, PanemuTableComponent, PanemuTableController, PanemuTableDataSource, PanemuTableService } from 'ngx-panemu-table';

interface Data { last_login: string }

const DATA: Data[] = [
  { "last_login": "2024-07-03 09:56:29" },
  { "last_login": "2024-04-29 12:48:59" },
  { "last_login": "2024-06-03 13:14:23" },
  { "last_login": "2024-06-18 12:06:58" },
  { "last_login": "2024-04-24 03:46:26" }
]

@Component({
    templateUrl: 'date-time-column.component.html',
    imports: [PanemuTableComponent]
})

export class DateTimeColumnComponent implements OnInit {

  columns = this.pts.buildColumns<Data>([
    { field: 'last_login', label: 'Original Data' },
    { field: 'last_login', type: ColumnType.DATETIME, label: 'Default Format' },
    {
      field: 'last_login',
      type: ColumnType.DATETIME,
      label: 'Custom Format', formatter: (val) => new Date(val).toISOString()
    },
  ])

  controller = PanemuTableController.create(this.columns, new PanemuTableDataSource(DATA), { autoHeight: true });

  constructor(private pts: PanemuTableService) { }

  ngOnInit() {
    this.controller.reloadData();
  }

}