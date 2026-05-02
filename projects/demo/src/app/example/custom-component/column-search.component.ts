import { Component, inject, OnInit, TemplateRef, viewChild, ViewEncapsulation } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { PanemuTableComponent, PanemuTableController, PanemuTableService } from 'ngx-panemu-table';
import { People } from '../../model/people';
import { DataService } from '../../service/data.service';
import { ColumnSearchDataSource } from './column-search-datasource';
import { HeaderFilterComponent } from './header-filter.component';

@Component({
    selector: 'column-search',
    templateUrl: 'column-search.component.html',
    imports: [PanemuTableComponent, ReactiveFormsModule],
    styles: `
  .panemu-table table tr th{
    padding: 2px 4px;
  }
  .panemu-table table th .resizable .bar {
    margin: 0 -6px 0 6px;
  }
  .panemu-table .default-cell {
    text-overflow: unset;//remove ellipsis
  }
  `,
    encapsulation: ViewEncapsulation.None
})

export class ColumnSearchComponent implements OnInit {
  footerTemplate = viewChild<TemplateRef<any>>('footerTemplate');
  pts = inject(PanemuTableService);
  dataService = inject(DataService);
  columns = this.pts.buildColumns<People>([
    { field: 'id', type: 'int' },
    { field: 'name', },
    { field: 'email' },
    { field: 'gender', type: 'map', valueMap: {F: 'Female', M: 'Male'} },
    { field: 'country', type: 'map', valueMap: this.dataService.getCountryMap() },
    { field: 'amount', type: 'decimal' },
    { field: 'enrolled', type: 'date' },
    { field: 'last_login', type: 'datetime' },
    { field: 'verified', type: 'boolean'},
  ])
  datasource = new ColumnSearchDataSource(this.columns);
  controller = PanemuTableController.create<People>(this.columns, this.datasource, {
    footer: {
      component: this.footerTemplate
    }
  });

  ngOnInit() {
    this.columns.body.forEach(item => item.headerRenderer = HeaderFilterComponent.create(this.controller))
    this.controller.maxRows = 10;
    this.dataService.getPeople().subscribe(result => {
      this.datasource.setData(result);
      this.controller.reloadData();
    });
    
  }

}