import { Component, inject, OnInit } from '@angular/core';
import { PanemuPaginationComponent, PanemuTableComponent, PanemuTableController, PanemuTableDataSource, PanemuTableService } from 'ngx-panemu-table';
import { People } from '../model/people';
import { DataService } from '../service/data.service';

@Component({
    templateUrl: 'pagination.component.html',
    imports: [PanemuTableComponent, PanemuPaginationComponent]
})

export class PaginationComponent implements OnInit {
  pts = inject(PanemuTableService);
  dataService = inject(DataService);
  columns = this.pts.buildColumns<People>([
    { field: 'id', type: 'int' },
    { field: 'name' },
    { field: 'email' },
    { field: 'gender', type: 'map', valueMap: { F: "Female", M: "Male" } },
    { field: 'country', type: 'map', valueMap: this.dataService.getCountryMap() },
    { field: 'amount', type: 'decimal' },
    { field: 'enrolled', type: 'date' },
    { field: 'last_login', type: 'datetime' },
    { field: 'verified', type: 'boolean'}
  ])
  datasource = new PanemuTableDataSource<People>;
  controller = PanemuTableController.create<People>(this.columns, this.datasource);

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