import { Component, inject, OnInit, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { PanemuTableComponent, PanemuTableController, PanemuTableService } from 'ngx-panemu-table';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { People } from '../../model/people';
import { DataService } from '../../service/data.service';
import { CustomPaginationComponent } from './custom-pagination.component';
import { GlobalSearchDataSource } from './global-search-datasource';
import { HighlightCellRenderer } from './highlight-cell-renderer';

@Component({
    selector: 'global-search',
    templateUrl: 'global-search.component.html',
    imports: [PanemuTableComponent, CustomPaginationComponent, ReactiveFormsModule]
})

export class GlobalSearchComponent implements OnInit {
  txtSearch = new FormControl('');
  searchTerm = signal('');
  pts = inject(PanemuTableService);
  dataService = inject(DataService);
  columns = this.pts.buildColumns<People>([
    { field: 'id', type: 'int' },
    { field: 'name' },
    { field: 'email' },
    { field: 'gender', type: 'map', valueMap: {F: 'Female', M: 'Male'} },
    { field: 'country', type: 'map', valueMap: this.dataService.getCountryMap() },
    { field: 'amount', type: 'decimal' },
    { field: 'enrolled', type: 'date' },
    { field: 'last_login', type: 'datetime' },
    { field: 'verified', type: 'boolean'},
  ], {
    //use this custom cell renderer for all columns above
    cellRenderer: HighlightCellRenderer.create(this.searchTerm)
  })
  datasource = new GlobalSearchDataSource(this.columns);
  controller = PanemuTableController.create<People>(this.columns, this.datasource);

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
      this.controller.criteria = { field: '', value: val!, type: 'eq' };
      this.controller.reloadData();
      this.searchTerm.set(val?.trim() ?? '')
    })
  }



}