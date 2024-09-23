import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ColumnType, PanemuPaginationComponent, PanemuQueryComponent, PanemuTableComponent, PanemuTableController, PanemuTableDataSource, PanemuTableService } from 'ngx-panemu-table';
import { People } from '../../model/people';
import { DataService } from '../../service/data.service';

@Component({
  selector: 'pnm-dynamic-row-style',
  templateUrl: 'dynamic-row-style.component.html',
  imports: [PanemuTableComponent, PanemuPaginationComponent, PanemuQueryComponent],
  standalone: true,
  styleUrl: 'dynamic-row-style.component.scss',
  encapsulation: ViewEncapsulation.None
})

export class DynamicRowStyleComponent implements OnInit {
  columns = this.pts.buildColumns<People>([
    { field: 'id', type: ColumnType.INT },
    { field: 'name' },
    { field: 'email' },
    { field: 'gender', type: ColumnType.MAP, valueMap: {F: 'Female', M: 'Male'} },
    { field: 'country', type: ColumnType.MAP, valueMap: this.dataService.getCountryMap() },
    { field: 'amount', type: ColumnType.DECIMAL },
    { field: 'enrolled', type: ColumnType.DATE },
    { field: 'last_login', type: ColumnType.DATETIME },
    { field: 'verified', type: ColumnType.MAP, valueMap: {true: 'Yes', false: 'No'}}
  ])
  datasource = new PanemuTableDataSource<People>;

  controller = PanemuTableController.create<People>(this.columns, this.datasource, { rowOptions: {
    // rowSelection: false,
    rowClass: (row: People) => {
      if (row.country == 'ID') return 'indonesia';
      return '';
    },
    rowStyle: (row) => {
      if (row.gender == 'F') return 'color: red;'
      return '';
    }
  }});

  constructor(private dataService: DataService, private pts: PanemuTableService) {}

  ngOnInit() {
    
    this.dataService.getPeople().subscribe(result => {
      this.datasource.setData(result);
      this.controller.reloadData();
    });

  }
  
}