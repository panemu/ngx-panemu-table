import { Component, OnInit, signal } from '@angular/core';
import { ColumnType, PanemuQueryComponent, PanemuTableComponent, PanemuTableController, PanemuTableDataSource, PanemuTableService } from 'ngx-panemu-table';
import { People } from '../model/people';
import { DataService } from '../service/data.service';

@Component({
    selector: 'pnm-column-type',
    templateUrl: 'column-type.component.html',
    imports: [PanemuTableComponent, PanemuQueryComponent]
})

export class ColumnTypeComponent implements OnInit {
  genderMap = signal({});
  columns = this.pts.buildColumns<People>([
    { field: 'id', type: ColumnType.INT, label: 'ID (int)' },
    { field: 'name' },
    { field: 'email' },
    { field: 'gender', type: ColumnType.MAP, valueMap: this.genderMap, label: 'Gender (map)' },
    { field: 'country' },
    { field: 'amount', type: ColumnType.DECIMAL, label: 'Amount (decimal)' },
    { field: 'enrolled', type: ColumnType.DATE, label: 'Enrolled (date)' },
    { field: 'last_login', type: ColumnType.DATETIME, label: 'Last Login (datetime)' },
  ])
  datasource = new PanemuTableDataSource<People>;
  controller = PanemuTableController.create<People>(this.columns, this.datasource);

  constructor(private dataService: DataService, private pts: PanemuTableService) { }

  ngOnInit() {
    this.dataService.getPeople().subscribe(result => {
      this.datasource.setData(result);
      this.controller.reloadData();
    });
    
    
    setTimeout(() => {
      //pretend it calls backend API
      this.genderMap.set({ F: "Female", M: "Male" });
    }, 2000);
  }

  
}