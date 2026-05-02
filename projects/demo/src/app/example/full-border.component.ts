import { Component, inject, ViewEncapsulation } from '@angular/core';
import { PanemuPaginationComponent, PanemuSettingComponent, PanemuTableComponent, PanemuTableController, PanemuTableDataSource, PanemuTableService, TickColumnController } from 'ngx-panemu-table';
import { People } from '../model/people';
import { DataService } from '../service/data.service';

@Component({
    selector: 'app-full-border',
    imports: [PanemuTableComponent, PanemuPaginationComponent, PanemuSettingComponent],
    templateUrl: './full-border.component.html',
    styleUrl: './full-border.component.scss',
    encapsulation: ViewEncapsulation.None
})
export class 
FullBorderComponent {
  pts = inject(PanemuTableService);
  dataService = inject(DataService);
  columns = this.pts.buildColumns<People>([
    {type: 'tick', controller: new TickColumnController()},
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
  controller = PanemuTableController.create<People>(this.columns, this.datasource, {autoHeight: true});

  ngOnInit(): void {
    this.controller.maxRows = 10;
    this.dataService.getPeople().subscribe({
      next: result => {
        this.datasource.setData(result);
        this.controller.reloadData();
      }
    })
  }
}
