import { Component, OnInit } from '@angular/core';
import { PanemuPaginationComponent, PanemuQueryComponent, PanemuTableComponent, PanemuTableController, PanemuTableDataSource, PanemuTableService, PropertyColumn } from 'ngx-panemu-table';
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
        { field: 'id', type: 'int' },
        { field: 'name' },
        { field: 'email' },
        { field: 'gender' },
        { field: 'country' },
        { field: 'amount', type: 'decimal' },
        { field: 'enrolled', type: 'date' },
        { field: 'last_login', type: 'datetime' },
      ] as PropertyColumn<People>[]
    ).pipe(
      delay(2000)
    )
  }

}