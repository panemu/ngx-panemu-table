import { Component, inject, OnInit, ViewEncapsulation } from '@angular/core';
import { PanemuPaginationComponent, PanemuQueryComponent, PanemuTableComponent, PanemuTableController, PanemuTableDataSource, PanemuTableService } from 'ngx-panemu-table';
import { People } from '../../model/people';
import { DataService } from '../../service/data.service';

@Component({
    selector: 'pnm-dynamic-row-style',
    templateUrl: 'dynamic-row-style.component.html',
    imports: [PanemuTableComponent, PanemuPaginationComponent, PanemuQueryComponent],
    styleUrl: 'dynamic-row-style.component.scss',
    encapsulation: ViewEncapsulation.None
})

export class DynamicRowStyleComponent implements OnInit {
  pts = inject(PanemuTableService);
  dataService = inject(DataService);
  columns = this.pts.buildColumns<People>([
    { field: 'id', type: 'int' },
    { field: 'name' },
    { field: 'email' },
    { field: 'gender', type: 'map', valueMap: {F: 'Female', M: 'Male'} },
    { field: 'country', type: 'map', valueMap: this.dataService.getCountryMap() },
    { field: 'amount', type: 'decimal' },
    { field: 'enrolled', type: 'date' },
    { field: 'last_login', type: 'datetime' },
    { field: 'verified', type: 'boolean'}
  ])
  datasource = new PanemuTableDataSource<People>;

  controller = PanemuTableController.create<People>(this.columns, this.datasource, { rowOptions: {
    // rowSelection: false,
    rowClass: (row: People) => {
      return row.country == 'ID' ? 'indonesia' : '';
    },
    rowStyle: (row) => {
      return row.gender == 'F' ? 'color: red;' : '';
    }
  }});

  ngOnInit() {
    
    this.dataService.getPeople().subscribe(result => {
      this.datasource.setData(result);
      this.controller.reloadData();
    });

  }
  
}