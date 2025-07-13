import { Component, computed, inject, Input, OnInit, Signal } from "@angular/core";
import { PanemuTableComponent, PanemuTableController, PanemuTableDataSource, PanemuTableService, PropertyColumn, ExpansionRowRenderer, TableQuery } from "ngx-panemu-table";
import { People } from "../../model/people";
import { DataService } from "../../service/data.service";

@Component({
    templateUrl: 'nested-table.component.html',
    imports: [PanemuTableComponent]
})

export class NestedTableComponent implements OnInit, ExpansionRowRenderer<People> {
  row!: People;
  column!: PropertyColumn<People>;
  close!: Function;
  pts = inject(PanemuTableService);
  dataService = inject(DataService);
  columns = this.pts.buildColumns<People>([
    { field: 'id' },
    { field: 'name' },
    { field: 'email' },
    { field: 'country' },

  ])
  datasource = new PanemuTableDataSource<People>
  controller = PanemuTableController.createWithCustomDataSource<People>(this.columns, this.loadData.bind(this));
  rowCount = computed(() => {
    if (this.controller.getAllDataAsSignal()) {
      return this.controller.getData().length
    }
    return 0
  })   

  ngOnInit() {
    this.dataService.getPeople().subscribe({
      next: people => {
        this.datasource.setData(people);
        this.controller.reloadData();
      }
    })
    
  }

  private loadData(startIndex: number, maxRows: number, tableQuery: TableQuery) {
    tableQuery.tableCriteria = [{field: 'country', value: this.row.country}];
    return this.datasource.getData(startIndex, maxRows, tableQuery);
  }
}