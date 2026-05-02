import { Component, inject, OnInit, TemplateRef, viewChild } from '@angular/core';
import { ComputedColumn, DefaultCellRenderer, DefaultRowGroupRenderer, PanemuPaginationComponent, PanemuQueryComponent, PanemuSettingComponent, PanemuTableComponent, PanemuTableController, PanemuTableDataSource, PanemuTableService, TickColumnController } from 'ngx-panemu-table';
import { People } from '../model/people';
import { DataService } from '../service/data.service';
import { FilterCountryCellComponent } from './custom-cell/filter-country-cell.component';
import { PeopleFormComponent } from './custom-cell/people-form.component';

@Component({
    templateUrl: 'persist-state.component.html',
    imports: [PanemuTableComponent, PanemuPaginationComponent, PanemuQueryComponent, PanemuSettingComponent],
    styleUrl: 'persist-state.component.scss'
})

export class PersistStateComponent implements OnInit {
  sendEmailTemplate = viewChild<TemplateRef<any>>('sendEmailTemplate');
  actionCellTemplate = viewChild<TemplateRef<any>>('actionCellTemplate');
  countryFooter = viewChild<TemplateRef<any>>('countryFooter');
  clmAction: ComputedColumn<People> = {
    type: 'computed',
    formatter: (val: any) => '',
    cellRenderer: DefaultCellRenderer.create(this.actionCellTemplate),
    expansion: { component: PeopleFormComponent },
    sticky: 'end',
    width: 80,
    resizable: false,
    cellStyle: (_: string) => 'border-left-color: rgba(0,0,0, .12); border-left-width: 1px; border-left-style: solid;'
  };

  pts = inject(PanemuTableService);
  dataService = inject(DataService);
  columns = this.pts.buildColumns<People>([
    { type: 'tick', controller: new TickColumnController()},
    { field: 'id', type: 'int'},
    { field: 'name' },
    {
      field: 'email', expansion: {
        component: this.sendEmailTemplate,
        isDisabled: (row) => {
          return row.country == 'ID'
        },
      }
    },
    { field: 'gender', type: 'map', valueMap: { F: 'Female', M: 'Male' } },
    {
      field: 'country', type: 'map', valueMap: this.dataService.getCountryMap(),
      cellRenderer: FilterCountryCellComponent.create(this.onCountryFilterClick.bind(this)),
      rowGroupRenderer: DefaultRowGroupRenderer.create({ footerComponent: this.countryFooter })
    },
    { field: 'amount', type: 'decimal' },
    { field: 'enrolled', type: 'date' },
    { field: 'last_login', type: 'datetime' },
    { field: 'verified', type: 'boolean', formatter: (val) => val === null || val === undefined ? '-' : val ? 'Yes' : 'No'},
    this.clmAction,
  ]
  )
  datasource = new PanemuTableDataSource<People>;
  controller = PanemuTableController.create<People>(this.columns, this.datasource, {
    saveState: {
      key:'PersistStateComponent',
      states: undefined
    }
  });

  ngOnInit() {
    this.dataService.getPeople().subscribe(result => {
      this.datasource.setData(result);
      this.controller.reloadData();
    });

  }

  onCountryFilterClick(value: any, propName: string) {
    this.controller.criteria = { field: propName, value: value, type: 'eq' }
    this.controller.reloadData();
    this.controller.saveState();
  }

  edit(row: People) {
    this.controller.expand(row, this.clmAction)
  }

  delete(row: People) {
    alert('Delete ' + JSON.stringify(row))
  }

}