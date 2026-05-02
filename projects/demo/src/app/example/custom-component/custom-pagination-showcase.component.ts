import { Component, inject, OnInit } from '@angular/core';
import { PanemuTableComponent, PanemuTableController, PanemuTableDataSource, PanemuTableService } from 'ngx-panemu-table';
import { People } from '../../model/people';
import { DataService } from '../../service/data.service';
import { CustomPaginationComponent } from './custom-pagination.component';

@Component({
    selector: 'custom-pagination-showcase',
    templateUrl: 'custom-pagination-showcase.component.html',
    imports: [PanemuTableComponent, CustomPaginationComponent]
})

export class CustomPaginationShowcaseComponent implements OnInit {
  pts = inject(PanemuTableService);
  dataService = inject(DataService);
  columns = this.pts.buildColumns<People>([
    { field: 'id', type: 'int' },
    { field: 'name' },
    { field: 'email' },
    { field: 'gender', type: 'map', valueMap: { F: 'Female', M: 'Male' } },
    { field: 'country', type: 'map', valueMap: this.dataService.getCountryMap() },
    { field: 'amount', type: 'decimal' },
    { field: 'enrolled', type: 'date' },
    { field: 'last_login', type: 'datetime' },
    { field: 'verified', type: 'boolean'},
  ]);
  datasource = new PanemuTableDataSource<People>;
  controller = PanemuTableController.create<People>(this.columns, this.datasource);

  ngOnInit() {
    this.controller.maxRows = 10;
    this.dataService.getPeople().subscribe(result => {
      this.datasource.setData(result);
      this.controller.reloadData();
    });

  }

  goTo3rd() {
    this.controller.maxRows = 20;
    this.controller.startIndex = this.controller.maxRows * 2;
    this.controller.reloadCurrentPage();
  }

}