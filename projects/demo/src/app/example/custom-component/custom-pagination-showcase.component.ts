import { Component, OnInit } from '@angular/core';
import { ColumnType, PanemuTableComponent, PanemuTableController, PanemuTableDataSource, PanemuTableService } from 'ngx-panemu-table';
import { People } from '../../model/people';
import { DataService } from '../../service/data.service';
import { CustomPaginationComponent } from './custom-pagination.component';

@Component({
  selector: 'custom-pagination-showcase',
  templateUrl: 'custom-pagination-showcase.component.html',
  imports: [PanemuTableComponent, CustomPaginationComponent],
  standalone: true,
})

export class CustomPaginationShowcaseComponent implements OnInit {

  columns = this.pts.buildColumns<People>([
    { field: 'id', type: ColumnType.INT },
    { field: 'name' },
    { field: 'email' },
    { field: 'gender', type: ColumnType.MAP, valueMap: { F: 'Female', M: 'Male' } },
    { field: 'country', type: ColumnType.MAP, valueMap: this.dataService.getCountryMap() },
    { field: 'amount', type: ColumnType.DECIMAL },
    { field: 'enrolled', type: ColumnType.DATE },
    { field: 'last_login', type: ColumnType.DATETIME },
    { field: 'verified', type: ColumnType.MAP, valueMap: { true: 'Yes', false: 'No' } },
  ]);
  datasource = new PanemuTableDataSource<People>;
  controller = PanemuTableController.create<People>(this.columns, this.datasource);

  constructor(private dataService: DataService, public pts: PanemuTableService) { }

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