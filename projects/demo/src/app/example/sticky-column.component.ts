import { Component, inject, OnInit } from '@angular/core';
import { PanemuTableComponent, PanemuTableController, PanemuTableDataSource, PanemuTableService, TickColumnController } from 'ngx-panemu-table';
import { People } from '../model/people';
import { DataService } from '../service/data.service';

@Component({
    selector: 'app-sticky-column',
    imports: [PanemuTableComponent],
    templateUrl: './sticky-column.component.html'
})
export class StickyColumnComponent implements OnInit {
  
  pts = inject(PanemuTableService);
  clmTick = new TickColumnController<People>()
  dataService = inject(DataService);
  columns = this.pts.buildColumns<People>([
    { type: 'tick', controller: this.clmTick},
    { field: 'id', sticky: 'start' },
    { field: 'name', width: 300 },
    { field: 'email', width: 300 },
    { field: 'gender'},
    { field: 'country', type: 'map', valueMap: this.dataService.getCountryMap() },
    { field: 'amount', type: 'decimal' },
    { field: 'enrolled', type: 'date' },
    { field: 'verified', sticky: 'end'},
    { field: 'last_login', type: 'datetime', sticky: 'end' },
  ])
  datasource = new PanemuTableDataSource<People>();
  controller = PanemuTableController.create<People>(this.columns, this.datasource);

  ngOnInit(): void {
    this.dataService.getPeople().subscribe({
      next: result => {
        this.datasource.setData(result);
        this.controller.reloadData();
      }
    })
  }
}
