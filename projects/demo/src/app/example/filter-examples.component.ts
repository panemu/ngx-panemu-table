import { CommonModule } from '@angular/common';
import { Component, TemplateRef, viewChild } from '@angular/core';
import { ColumnType, PanemuQueryComponent, PanemuTableComponent, PanemuTableController, PanemuTableDataSource, PanemuTableService } from 'ngx-panemu-table';
import { People } from '../model/people';
import { DataService } from '../service/data.service';

@Component({
  standalone: true,
  imports: [CommonModule, PanemuTableComponent, PanemuQueryComponent],
  templateUrl: './filter-examples.component.html',
})
export class FilterExamplesComponent {
  footerTemplate = viewChild<TemplateRef<any>>('footerTemplate');

  columns = this.pts.buildColumns<People>([
    { field: 'id', type: ColumnType.INT },
    { field: 'name' },
    { field: 'email' },
    { field: 'gender', type: ColumnType.MAP, valueMap: { F: "Female", M: "Male" } },
    { field: 'country', type: ColumnType.MAP, valueMap: this.dataService.getCountryMap() },
    { field: 'amount', type: ColumnType.DECIMAL },
    { field: 'enrolled', type: ColumnType.DATE },
    { field: 'last_login', type: ColumnType.DATETIME },
    { field: 'verified', type: ColumnType.MAP, valueMap: { true: 'Yes', false: 'No' } }
  ])
  datasource = new PanemuTableDataSource<People>;
  controller = PanemuTableController.create<People>(this.columns, this.datasource,
    {
      virtualScroll: true,
      virtualScrollRowHeight: 32,
      footer: { component: this.footerTemplate }
    }
  );
  totalRows = 0;
  constructor(private dataService: DataService, private pts: PanemuTableService) { }

  ngOnInit() {
    this.dataService.getPeople().subscribe(result => {
      this.datasource.setData(result);
      this.controller.reloadData();
    })

    this.controller.afterReloadEvent.subscribe({
      next: tableData => {
        this.totalRows = tableData?.totalRows || 0;
      }
    })
  }



  idLessOrEqual() {
    this.controller.criteria = [{ field: 'id', value: '..5' }]
    this.controller.reloadData();
  }
  idLessThan() {
    this.controller.criteria = [{ field: 'id', value: '.,5' }]
    this.controller.reloadData();
  }

  idGreaterOrEqual() {
    this.controller.criteria = [{ field: 'id', value: '5..' }]
    this.controller.reloadData();
  }

  idGreaterThan() {
    this.controller.criteria = [{ field: 'id', value: '5,.' }]
    this.controller.reloadData();
  }

  idBetweenInclusive() {
    this.controller.criteria = [{ field: 'id', value: '5..10' }]
    this.controller.reloadData();
  }

  idBetweenExclusive() {
    this.controller.criteria = [{ field: 'id', value: '5,,10' }]
    this.controller.reloadData();
  }

  enrolledBetween() {
    this.controller.criteria = [{ field: 'enrolled', value: '2023-01-01..2023-01-31' }]
    this.controller.sortedColumn = { enrolled: 'asc' }
    this.controller.reloadData();
  }

  lastLoginBetween() {
    this.controller.criteria = [{ field: 'last_login', value: '2024-03-22.,2024-03-26' }]
    this.controller.sortedColumn = { last_login: 'asc' }
    this.controller.reloadData();
  }

  nameContains() {
    this.controller.criteria = [{ field: 'name', value: 'co' }]
    this.controller.reloadData();
  }

  
}
