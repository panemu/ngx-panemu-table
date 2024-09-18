import { Component, OnInit } from '@angular/core';
import { ColumnType, PanemuPaginationComponent, PanemuTableComponent, PanemuTableController, PanemuTableDataSource, PanemuTableService } from 'ngx-panemu-table';
import { People } from '../model/people';
import { DataService } from '../service/data.service';

@Component({
  templateUrl: 'pagination.component.html',
  imports: [PanemuTableComponent, PanemuPaginationComponent],
  standalone: true,
})

export class PaginationComponent implements OnInit {
  columns = this.pts.buildColumns<People>([
    { field: 'id', type: ColumnType.INT },
    { field: 'name' },
    { field: 'email' },
    { field: 'gender', type: ColumnType.MAP, valueMap: { F: "Female", M: "Male" } },
    { field: 'country', type: ColumnType.MAP, valueMap: this.dataService.getCountryMap() },
    { field: 'amount', type: ColumnType.DECIMAL },
    { field: 'enrolled', type: ColumnType.DATE },
    { field: 'last_login', type: ColumnType.DATETIME },
    { field: 'verified', type: ColumnType.MAP, valueMap: { true: 'Yes', false: 'No' } }
  ])
  datasource = new PanemuTableDataSource<People>;
  controller = PanemuTableController.create<People>(this.columns, this.datasource);

  constructor(private dataService: DataService, private pts: PanemuTableService) { }

  ngOnInit() {

    //retrieve data from server
    this.dataService.getPeople().subscribe(result => {

      //set the data to datasource
      this.datasource.setData(result);

      //render the data in table by calling controller.reloadData()
      this.controller.reloadData();
    })
  }
}