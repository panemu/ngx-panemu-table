import { Component, computed, Input, OnInit, Signal } from "@angular/core";
import { PanemuTableComponent, PanemuTableController, PanemuTableDataSource, PanemuTableService, PropertyColumn, ExpansionRowRenderer, TableQuery } from "ngx-panemu-table";
import { People } from "../../model/people";
import { DataService } from "../../service/data.service";

@Component({
  templateUrl: 'nested-table.component.html',
  imports: [PanemuTableComponent],
  standalone: true
})

export class NestedTableComponent implements OnInit, ExpansionRowRenderer<People> {
  @Input() row!: People;
  @Input() column!: PropertyColumn<People>;
  @Input() close!: Function;

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

  constructor(private pts: PanemuTableService, private dataService: DataService) { }
  

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