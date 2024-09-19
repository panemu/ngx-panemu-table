import { Component } from '@angular/core';
import { ColumnType, PanemuPaginationComponent, PanemuTableComponent, PanemuTableController, PanemuTableDataSource, PanemuTableService } from 'ngx-panemu-table';
import { People } from '../model/people';
import { DataService } from '../service/data.service';
import {MatSliderModule} from '@angular/material/slider';
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  imports: [
    PanemuTableComponent, 
    PanemuPaginationComponent, 
    MatSliderModule,
    FormsModule
  ],
  templateUrl: './vertical-scroll.component.html',
})
export class VerticalScrollComponent {
  height = 300
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

    this.dataService.getPeople().subscribe(result => {
      this.datasource.setData(result);
      this.controller.reloadData();
    })
  }
}
