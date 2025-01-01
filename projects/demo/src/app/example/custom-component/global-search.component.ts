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
  notSearchableHeader = viewChild<TemplateRef<any>>('notSearchable');
  txtSearch = new FormControl('');
  columns = this.pts.buildColumns<People>([
    { field: 'id', type: ColumnType.INT, width: 60 },
    { field: 'name', width: 150 },
    { field: 'email', width: 230 },
    { field: 'gender', width: 80, type: ColumnType.MAP, valueMap: {F: 'Female', M: 'Male'} },
    { field: 'country', width: 150, type: ColumnType.MAP, valueMap: this.dataService.getCountryMap() },
    { field: 'amount', width: 100, type: ColumnType.DECIMAL, headerRenderer: DefaultHeaderRenderer.create(this.notSearchableHeader) },
    { field: 'enrolled', width: 150, type: ColumnType.DATE, headerRenderer: DefaultHeaderRenderer.create(this.notSearchableHeader) },
    { field: 'last_login', width: 180, type: ColumnType.DATETIME, headerRenderer: DefaultHeaderRenderer.create(this.notSearchableHeader) },
    { field: 'verified', width: 80, type: ColumnType.MAP, valueMap: { true: 'Yes', false: 'No' }, headerRenderer: DefaultHeaderRenderer.create(this.notSearchableHeader) },
  ]
  )
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
      console.log('criteria: ', val)
      this.controller.criteria = [{ field: '', value: val }];
      this.controller.reloadData();
    })
  }



}