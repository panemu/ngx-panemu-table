import { Component, inject, OnInit } from '@angular/core';
import { PanemuPaginationComponent, PanemuQueryComponent, PanemuSettingComponent, PanemuTableComponent, PanemuTableController, PanemuTableDataSource, PanemuTableService, TickColumnController } from 'ngx-panemu-table';
import { People } from '../model/people';
import { DataService } from '../service/data.service';


@Component({
  templateUrl: 'tickable-row.component.html',
  imports: [PanemuTableComponent, PanemuPaginationComponent, PanemuQueryComponent, PanemuSettingComponent]
})

export class TickableRowComponent implements OnInit {

  clmTick = new TickColumnController<People>();
  clmTick2 = new TickColumnController<People>()
  pts = inject(PanemuTableService);
  columns = this.pts.buildColumns<People>([
    { type: 'tick', controller: this.clmTick },
    { field: 'id', sticky: 'start' },
    { field: 'name' },
    { field: 'email' },
    { type: 'tick', controller: this.clmTick2, label: 'Tick 2', sticky: null, checkBoxHeader: false, isDisabled: (row) => row.gender == 'M' },
    { field: 'gender' },
    { field: 'country' },
    { field: 'amount', type: 'decimal' },
    { field: 'enrolled', type: 'date' },
    { field: 'last_login', type: 'datetime' },
  ])

  datasource = new PanemuTableDataSource<People>;
  controller = PanemuTableController.create<People>(this.columns, this.datasource);

  constructor(private dataService: DataService) {

  }

  ngOnInit() {
    this.dataService.getPeople().subscribe(result => {
      this.datasource.setData(result);
      this.controller.reloadData();
    })
  }

  tickAll() {
    this.clmTick.setTickedAll(true);
  }

  toggleFirstRow() {
    const firstRow = this.controller.getData()[0];
    this.clmTick.setTicked(!this.clmTick.isTicked(firstRow), firstRow);
  }

  untickAll() {
    this.clmTick.setTickedAll(false);
  }

  getTickedRows() {
    const tickedRows = this.clmTick.getTickedRows().length;

    alert('Ticked Rows: ' + tickedRows);
  }
}