import { Component, OnInit, TemplateRef, viewChild } from '@angular/core';
import { CellFormatter, ColumnDefinition, ColumnType, DefaultHeaderRenderer, PanemuTableComponent, PanemuTableController, PanemuTableDataSource, PanemuTableService, TableCriteria } from 'ngx-panemu-table';
import { People } from '../../model/people';
import { DataService } from '../../service/data.service';
import { CustomPaginationComponent } from './custom-pagination.component';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { GlobalSearchDataSource } from './global-search-datasource';

@Component({
  selector: 'global-search',
  templateUrl: 'global-search.component.html',
  imports: [PanemuTableComponent, CustomPaginationComponent, ReactiveFormsModule],
  standalone: true,
})

export class GlobalSearchComponent implements OnInit {
  txtSearch = new FormControl('');
  columns = this.pts.buildColumns<People>([
    { field: 'id', type: ColumnType.INT },
    { field: 'name' },
    { field: 'email' },
    { field: 'gender', type: ColumnType.MAP, valueMap: {F: 'Female', M: 'Male'} },
    { field: 'country', type: ColumnType.MAP, valueMap: this.dataService.getCountryMap() },
    { field: 'amount', type: ColumnType.DECIMAL },
    { field: 'enrolled', type: ColumnType.DATE },
    { field: 'last_login', type: ColumnType.DATETIME },
    { field: 'verified', type: ColumnType.MAP, valueMap: { true: 'Yes', false: 'No' } },
  ])
  datasource = new GlobalSearchDataSource(this.columns);
  controller = PanemuTableController.create<People>(this.columns, this.datasource);

  constructor(private dataService: DataService, public pts: PanemuTableService) { }

  ngOnInit() {
    this.controller.maxRows = 10;
    this.dataService.getPeople().subscribe(result => {
      this.datasource.setData(result);
      this.controller.reloadData();
    });
    this.txtSearch.valueChanges.pipe(
      debounceTime(250),
      distinctUntilChanged()
    ).subscribe(val => {
      this.controller.criteria = [{ field: '', value: val }];
      this.controller.reloadData();
    })
  }



}