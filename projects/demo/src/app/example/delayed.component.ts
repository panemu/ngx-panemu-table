import { Component, OnInit } from '@angular/core';
import { ColumnType, PanemuPaginationComponent, PanemuQueryComponent, PanemuTableComponent, PanemuTableController, PanemuTableDataSource, PanemuTableService, PropertyColumn } from 'ngx-panemu-table';
import { delay, forkJoin, of } from 'rxjs';
import { People } from '../model/people';
import { DataService } from '../service/data.service';


@Component({
    selector: 'pnm-delayed',
    templateUrl: 'delayed.component.html',
    imports: [PanemuTableComponent, PanemuPaginationComponent, PanemuQueryComponent]
})

export class DelayedComponent implements OnInit {
  controller!: PanemuTableController<People>;

  constructor(private dataService: DataService, private pts: PanemuTableService) { }

  ngOnInit() {

    forkJoin({
      columns: this.getColumnDefinition(),
      data: this.dataService.getPeople()
    }).subscribe(forkResult => {
      this.controller = PanemuTableController.create(this.pts.buildColumns(forkResult.columns as any), new PanemuTableDataSource(forkResult.data));
      this.controller.reloadData();
    })
    
  }

  private getColumnDefinition() {
    return of(
      [
        { field: 'id', type: ColumnType.INT },
        { field: 'name' },
        { field: 'email' },
        { field: 'gender' },
        { field: 'country' },
        { field: 'amount', type: ColumnType.DECIMAL },
        { field: 'enrolled', type: ColumnType.DATE },
        { field: 'last_login', type: ColumnType.DATETIME },
      ] as PropertyColumn<People>[]
    ).pipe(
      delay(2000)
    )
  }

}