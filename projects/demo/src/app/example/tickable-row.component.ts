import { Component, OnInit } from '@angular/core';
import { ColumnType, PanemuPaginationComponent, PanemuQueryComponent, PanemuTableComponent, PanemuTableController, PanemuTableDataSource, PanemuTableService, TickColumnClass } from 'ngx-panemu-table';
import { People } from '../model/people';
import { DataService } from '../service/data.service';


@Component({
  templateUrl: 'tickable-row.component.html',
  imports: [PanemuTableComponent, PanemuPaginationComponent, PanemuQueryComponent],
  standalone: true,
})

export class TickableRowComponent implements OnInit {
  
  clmTick = new TickColumnClass<People>()
  clmTick2 = new TickColumnClass<People>({ label: 'Tick 2', sticky: null, checkBoxHeader: false, isDisabled: (row) => row.gender == 'M' })
  columns = this.pts.buildColumns<People>([
    this.clmTick,
    { field: 'id', },
    { field: 'name' },
    { field: 'email' },
    this.clmTick2,
    { field: 'gender'},
    { field: 'country' },
    { field: 'amount', type: ColumnType.DECIMAL },
    { field: 'enrolled', type: ColumnType.DATE },
    { field: 'last_login', type: ColumnType.DATETIME },
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

  tickAll() {
    this.clmTick.setTickedAll(true);
  }
  
  toggleFirstRow() {
    this.clmTick.setTicked(!this.clmTick.isTicked(this.datasource.getAllData()[0]), this.datasource.getAllData()[0]);
  }

  untickAll() {
    this.clmTick.setTickedAll(false);
  }

  getTickedRows() {
    const tickedRows = this.clmTick.getTickedRows().length;
    alert('Ticked Rows: ' + tickedRows);
  }
}