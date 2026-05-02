import { Component, inject } from '@angular/core';
import { PanemuPaginationComponent, PanemuQueryComponent, PanemuTableComponent, PanemuTableController, PanemuTableDataSource, PanemuTableService } from 'ngx-panemu-table';
import { People } from '../model/people';
import { DataService } from '../service/data.service';

@Component({
    imports: [PanemuTableComponent, PanemuPaginationComponent, PanemuQueryComponent],
    templateUrl: './custom-filter-editor.component.html'
})
export class CustomFilterEditorComponent {

  pts = inject(PanemuTableService);
  dataService = inject(DataService);
  columns = this.pts.buildColumns<People>([
    { field: 'id', type: 'int', width: 50 },
    { field: 'name', width: 150 },
    { field: 'gender', width: 80, type: 'map', valueMap: { F: 'Female', M: 'Male' } },
    { field: 'amount', width: 100, type: 'decimal' },
    { field: 'enrolled', width: 150, type: 'date' },
    { field: 'verified', 
      width: 80, 
      type: 'boolean', 
      // filterEditor: BooleanFilterComponent
    },
    { field: 'last_login', width: 150, type: 'datetime' },
  ])
  datasource = new PanemuTableDataSource<People>;
  controller = PanemuTableController.create<People>(this.columns, this.datasource);

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
