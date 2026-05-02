import { Component, inject, OnInit } from '@angular/core';
import { PanemuTableComponent, PanemuTableController, PanemuTableDataSource, PanemuTableService } from 'ngx-panemu-table';
import { People } from '../model/people';
import { DataService } from '../service/data.service';

@Component({
  selector: 'pnm-column-width',
  templateUrl: 'column-width.component.html',
  imports: [PanemuTableComponent],
  standalone: true
})

export class ColumnWidthComponent implements OnInit {
  private dataService = inject(DataService);
  private pts = inject(PanemuTableService);
  columns = this.pts.buildColumns<People>([
    { field: 'id', width: 300 },
    { field: 'name', width: 300 },
    { field: 'email', width: 300 },
    { field: 'gender', width: 300 },
    { field: 'country', width: 300 },
    { field: 'amount', type: 'decimal', width: 300 },
    { field: 'enrolled', type: 'date' },
    { field: 'last_login', type: 'datetime' },
  ])
  datasource = new PanemuTableDataSource<People>;
  controller = PanemuTableController.create<People>(this.columns, this.datasource);

  ngOnInit() {
    this.dataService.getPeople().subscribe(result => {

      this.datasource.setData(result);
      this.controller.reloadData();
    });

  }


}