import { Component, OnInit } from '@angular/core';
import { ColumnType, PanemuTableComponent, PanemuTableController, PanemuTableDataSource, PanemuTableService } from 'ngx-panemu-table';
import { CustomPanemuTableService } from '../../../service/custom-panemu-table.service';

interface Data { enrolled: string }

const DATA: Data[] = [
  { "enrolled": "2023-04-26" },
  { "enrolled": "2023-11-01" },
  { "enrolled": "2023-01-03" },
  { "enrolled": "2023-07-01" },
  { "enrolled": "2023-12-25" },
]

@Component({
    templateUrl: 'date-column.component.html',
    imports: [PanemuTableComponent],
    providers: [{ provide: PanemuTableService, useClass: CustomPanemuTableService }]
})

export class DateColumnComponent implements OnInit {

  columns = this.pts.buildColumns<Data>([
    { field: 'enrolled', label: 'Regular Column' },
    { field: 'enrolled', type: ColumnType.DATE, label: 'Default Format' },
    {
      field: 'enrolled',
      type: ColumnType.DATE,
      label: 'Custom Format', formatter: (val) => new Date(val).toLocaleDateString()
    },
  ])

  controller = PanemuTableController.create(this.columns, new PanemuTableDataSource(DATA), {autoHeight: true});

  constructor(private pts: PanemuTableService) {}

  ngOnInit() {
    console.log('translation', this.pts.getLabelTranslation());
    this.controller.reloadData();
  }

}