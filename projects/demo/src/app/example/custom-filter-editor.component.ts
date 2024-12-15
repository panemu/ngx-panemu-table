import { Component } from '@angular/core';
import { ColumnType, PanemuPaginationComponent, PanemuQueryComponent, PanemuTableComponent, PanemuTableController, PanemuTableDataSource, PanemuTableService, TickColumnClass } from 'ngx-panemu-table';
import { People } from '../model/people';
import { DataService } from '../service/data.service';
import { BooleanFilterComponent } from './custom-filter/boolean-filter.component';

@Component({
  standalone: true,
  imports: [PanemuTableComponent, PanemuPaginationComponent, PanemuQueryComponent],
  templateUrl: './custom-filter-editor.component.html',
})
export class CustomFilterEditorComponent {

  columns = this.pts.buildColumns<People>([
    new TickColumnClass<People>({ width: 40 }),
    { field: 'id', type: ColumnType.INT, width: 50 },
    { field: 'name', width: 150 },
    { field: 'gender', width: 80, type: ColumnType.MAP, valueMap: { F: 'Female', M: 'Male' } },
    { field: 'amount', width: 100, type: ColumnType.DECIMAL },
    { field: 'enrolled', width: 150, type: ColumnType.DATE },
    { field: 'verified', 
      width: 80, 
      type: ColumnType.MAP, 
      valueMap: { true: 'Yes', false: 'No' },
      filterEditor: BooleanFilterComponent
    },
    { field: 'last_login', width: 150, type: ColumnType.DATETIME },
  ])
  datasource = new PanemuTableDataSource<People>;
  controller = PanemuTableController.create<People>(this.columns, this.datasource);

  constructor(private dataService: DataService, private pts: PanemuTableService) { }

  ngOnInit() {

    this.dataService.getPeople().subscribe(result => {
      this.datasource.setData(result);
      this.controller.reloadData();
    });


  }

 
  exportCsv() {
    /**
     * The getCsvData() can accept parameter to exclude header or row group.
     * {includeRowGroup: false, includeHeader: false}
     */
    const csvString = this.controller.getCsvData();

    const dl = "data:text/csv;charset=utf-8," + csvString;
    window.open(encodeURI(dl))
  }
}
