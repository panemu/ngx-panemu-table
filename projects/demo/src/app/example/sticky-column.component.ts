import { Component, inject, OnInit } from '@angular/core';
import { ColumnType, PanemuTableComponent, PanemuTableController, PanemuTableDataSource, PanemuTableService, TickColumnClass } from 'ngx-panemu-table';
import { People } from '../model/people';
import { DataService } from '../service/data.service';

@Component({
  selector: 'app-sticky-column',
  standalone: true,
  imports: [PanemuTableComponent],
  templateUrl: './sticky-column.component.html',
})
export class StickyColumnComponent implements OnInit {
  
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
