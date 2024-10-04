import { Component, inject, OnInit, ViewEncapsulation } from '@angular/core';
import { ColumnType, PanemuPaginationComponent, PanemuSettingComponent, PanemuTableComponent, PanemuTableController, PanemuTableDataSource, PanemuTableService, TickColumnClass } from 'ngx-panemu-table';
import { People } from '../model/people';
import { DataService } from '../service/data.service';

@Component({
  selector: 'app-full-border',
  standalone: true,
  imports: [PanemuTableComponent, PanemuPaginationComponent, PanemuSettingComponent],
  templateUrl: './full-border.component.html',
  styleUrl: './full-border.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class 
FullBorderComponent {
  pts = inject(PanemuTableService);
  clmTick = new TickColumnClass<People>()
  dataService = inject(DataService);
  columns = this.pts.buildColumns<People>([
    this.clmTick,
    { field: 'id', sticky: 'start' },
    { field: 'name', width: 300 },
    { field: 'email', width: 300 },
    { field: 'gender'},
    { field: 'country', type: ColumnType.MAP, valueMap: this.dataService.getCountryMap() },
    { field: 'amount', type: ColumnType.DECIMAL },
    { field: 'enrolled', type: ColumnType.DATE },
    { field: 'verified', sticky: 'end'},
    { field: 'last_login', type: ColumnType.DATETIME, sticky: 'end' },
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
