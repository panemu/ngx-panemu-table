import { Component, inject, OnInit, signal } from '@angular/core';
import { PanemuQueryComponent, PanemuTableComponent, PanemuTableController, PanemuTableDataSource, PanemuTableService } from 'ngx-panemu-table';
import { People } from '../model/people';
import { DataService } from '../service/data.service';

@Component({
    selector: 'pnm-column-type',
    templateUrl: 'column-type.component.html',
    imports: [PanemuTableComponent, PanemuQueryComponent]
})

export class ColumnTypeComponent implements OnInit {
  genderMap = signal({});
  pts = inject(PanemuTableService);
  dataService = inject(DataService);
  columns = this.pts.buildColumns<People>([
    { field: 'id', type: 'int', label: 'ID (int)' },
    { field: 'name' },
    { field: 'email' },
    { field: 'gender', type: 'map', valueMap: this.genderMap, label: 'Gender (map)' },
    { field: 'country' },
    { field: 'amount', type: 'decimal', label: 'Amount (decimal)' },
    { field: 'enrolled', type: 'date', label: 'Enrolled (date)' },
    { field: 'last_login', type: 'datetime', label: 'Last Login (datetime)' },
  ])
  datasource = new PanemuTableDataSource<People>;
  controller = PanemuTableController.create<People>(this.columns, this.datasource);

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