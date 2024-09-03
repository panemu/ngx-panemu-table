import { Component, OnInit } from '@angular/core';
import { ColumnType, PanemuTableComponent, PanemuTableController, PanemuTableDataSource, PanemuTableService } from 'ngx-panemu-table';
import { People } from '../model/people';
import { DataService } from '../service/data.service';

@Component({
  selector: 'pnm-column-width',
  templateUrl: 'column-width.component.html',
  imports: [PanemuTableComponent],
  standalone: true
})

export class ColumnWidthComponent implements OnInit {

  columns = this.pts.buildColumns<People>([
    { field: 'id', width: 300 },
    { field: 'name', width: 300 },
    { field: 'email', width: 300 },
    { field: 'gender', width: 300 },
    { field: 'country', width: 300 },
    { field: 'amount', type: ColumnType.DECIMAL, width: 300 },
    { field: 'enrolled', type: ColumnType.DATE },
    { field: 'last_login', type: ColumnType.DATETIME },
  ])
  datasource = new PanemuTableDataSource<People>;
  controller = PanemuTableController.create<People>(this.columns, this.datasource);

  constructor(private dataService: DataService, private pts: PanemuTableService) { }

  ngOnInit() {
    this.dataService.getPeople().subscribe(result => {

      this.datasource.setData(result);
      this.controller.reloadData();
    });

  }


}