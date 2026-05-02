
import { Component, inject, TemplateRef, viewChild } from '@angular/core';
import { PanemuQueryComponent, PanemuTableComponent, PanemuTableController, PanemuTableDataSource, PanemuTableService } from 'ngx-panemu-table';
import { People } from '../model/people';
import { DataService } from '../service/data.service';

@Component({
  imports: [PanemuTableComponent, PanemuQueryComponent],
  templateUrl: './filter-examples.component.html'
})
export class FilterExamplesComponent {
  footerTemplate = viewChild<TemplateRef<any>>('footerTemplate');
  pts = inject(PanemuTableService);
  dataService = inject(DataService);
  columns = this.pts.buildColumns<People>([
    { field: 'id', type: 'int' },
    { field: 'name' },
    { field: 'email' },
    { field: 'gender', type: 'map', valueMap: { F: "Female", M: "Male" } },
    { field: 'country', type: 'map', valueMap: this.dataService.getCountryMap() },
    { field: 'amount', type: 'decimal' },
    { field: 'enrolled', type: 'date' },
    { field: 'last_login', type: 'datetime' },
    { field: 'verified', type: 'boolean'}
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

  ngOnInit() {
    this.dataService.getPeople().subscribe(result => {
      result[2].name = 'Abagail Kingscote 2';
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
    this.controller.criteria = { type: 'lte', field: 'id', value: '5' }
    this.controller.reloadData();
  }
  idLessThan() {
    this.controller.criteria = { type: 'lt', field: 'id', value: '5' }
    this.controller.reloadData();
  }

  idGreaterOrEqual() {
    this.controller.criteria = { type: 'gte', field: 'id', value: '5' }
    this.controller.reloadData();
  }

  idGreaterThan() {
    this.controller.criteria = { type: 'gt', field: 'id', value: '5' }
    this.controller.reloadData();
  }

  idBetweenInclusive() {
    this.controller.criteria = {
      type: 'and',
      operands: [
        { type: 'gte', field: 'id', value: '5' },
        { type: 'lte', field: 'id', value: '10' }
      ]
    }

    this.controller.reloadData();
  }

  idBetweenExclusive() {
    this.controller.criteria = {
      type: 'and',
      operands: [
        { type: 'gt', field: 'id', value: '5' },
        { type: 'lt', field: 'id', value: '10' }
      ]
    }
    this.controller.reloadData();
  }

  enrolledBetween() {
    this.controller.criteria = {
      type: 'and',
      operands: [
        { type: 'gte', field: 'enrolled', value: '2023-01-01' },
        { type: 'lte', field: 'enrolled', value: '2023-01-31' }
      ]
    };
    this.controller.sortedColumn = { enrolled: 'asc' }
    this.controller.reloadData();
  }

  lastLoginBetween() {
    this.controller.criteria = {
      type: 'and',
      operands: [
        { type: 'gte', field: 'last_login', value: '2024-03-22T00:00' },
        { type: 'lte', field: 'last_login', value: '2024-03-26T00:00' }
      ]
    };
    this.controller.sortedColumn = { last_login: 'asc' }
    this.controller.reloadData();
  }

  nameContains() {
    this.controller.criteria = { type: 'like', field: 'name', pattern: '%co%', caseInsensitive: true }
    this.controller.reloadData();
  }

  nameExact() {
    this.controller.criteria = { type: 'eq', field: 'name', value: 'Abagail Kingscote' }
    this.controller.reloadData();
  }
}
