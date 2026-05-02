import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatSliderModule } from '@angular/material/slider';
import { PanemuPaginationComponent, PanemuTableComponent, PanemuTableController, PanemuTableDataSource, PanemuTableService } from 'ngx-panemu-table';
import { People } from '../model/people';
import { DataService } from '../service/data.service';

@Component({
    imports: [
        PanemuTableComponent,
        PanemuPaginationComponent,
        MatSliderModule,
        FormsModule
    ],
    templateUrl: './vertical-scroll.component.html'
})
export class VerticalScrollComponent {
  height = 300
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

  constructor() { }

  ngOnInit() {

    this.dataService.getPeople().subscribe(result => {
      this.datasource.setData(result);
      this.controller.reloadData();
    })
  }
}
