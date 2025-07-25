import { Component, inject, OnInit, ViewEncapsulation } from '@angular/core';
import { ColumnType, PanemuPaginationComponent, PanemuQueryComponent, PanemuTableComponent, PanemuTableController, PanemuTableDataSource, PanemuTableService } from 'ngx-panemu-table';
import { People } from '../../model/people';
import { DataService } from '../../service/data.service';

@Component({
    selector: 'pnm-dynamic-cell-style',
    templateUrl: 'dynamic-cell-style.component.html',
    imports: [PanemuTableComponent, PanemuPaginationComponent, PanemuQueryComponent],
    styleUrl: 'dynamic-cell-style.component.scss',
    encapsulation: ViewEncapsulation.None
})

export class DynamicCellStyleComponent implements OnInit {
  pts = inject(PanemuTableService);
  dataService = inject(DataService);
  columns = this.pts.buildColumns<People>([
    { field: 'name', 
      cellClass:(value, row) => row.verified ? 'cell-verified' : '',
      cellStyle:(value, row) => row.gender == 'M' ? 'color:red;' : ''
    },
    { field: 'email' , },
    { field: 'gender', type: ColumnType.MAP, valueMap: {F: 'Female', M: 'Male'} },
    { field: 'verified', type: ColumnType.MAP, valueMap: {true: 'Yes', false: 'No'}}
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