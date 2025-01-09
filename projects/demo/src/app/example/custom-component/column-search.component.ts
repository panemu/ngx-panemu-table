import { Component, OnInit, TemplateRef, viewChild, ViewEncapsulation } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ColumnType, PanemuTableComponent, PanemuTableController, PanemuTableService } from 'ngx-panemu-table';
import { People } from '../../model/people';
import { DataService } from '../../service/data.service';
import { ColumnSearchDataSource } from './column-search-datasource';
import { HeaderFilterComponent } from './header-filter.component';

@Component({
  selector: 'column-search',
  templateUrl: 'column-search.component.html',
  imports: [PanemuTableComponent, ReactiveFormsModule],
  standalone: true,
  styles :`
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
  columns = this.pts.buildColumns<People>([
    { field: 'id', type: ColumnType.INT },
    { field: 'name', },
    { field: 'email' },
    { field: 'gender', type: ColumnType.MAP, valueMap: {F: 'Female', M: 'Male'} },
    { field: 'country', type: ColumnType.MAP, valueMap: this.dataService.getCountryMap() },
    { field: 'amount', type: ColumnType.DECIMAL },
    { field: 'enrolled', type: ColumnType.DATE },
    { field: 'last_login', type: ColumnType.DATETIME },
    { field: 'verified', type: ColumnType.MAP, valueMap: { true: 'Yes', false: 'No' } },
  ])
  datasource = new ColumnSearchDataSource(this.columns);
  controller = PanemuTableController.create<People>(this.columns, this.datasource, {
    footer: {
      component: this.footerTemplate
    }
  });

  constructor(private dataService: DataService, public pts: PanemuTableService) { }

  ngOnInit() {
    this.columns.body.forEach(item => item.headerRenderer = HeaderFilterComponent.create(this.controller))
    this.controller.maxRows = 10;
    this.dataService.getPeople().subscribe(result => {
      this.datasource.setData(result);
      this.controller.reloadData();
    });
    
  }

}