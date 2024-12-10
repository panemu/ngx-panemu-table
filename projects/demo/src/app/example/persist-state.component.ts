import { Component, OnInit, signal, TemplateRef, viewChild } from '@angular/core';
import { ColumnType, ComputedColumn, DefaultCellRenderer, DefaultRowGroupRenderer, PanemuPaginationComponent, PanemuQueryComponent, PanemuSettingComponent, PanemuTableComponent, PanemuTableController, PanemuTableDataSource, PanemuTableService, TickColumnClass } from 'ngx-panemu-table';
import { People } from '../model/people';
import { DataService } from '../service/data.service';
import { FilterCountryCellComponent } from './custom-cell/filter-country-cell.component';
import { PeopleFormComponent } from './custom-cell/people-form.component';

@Component({
  templateUrl: 'persist-state.component.html',
  imports: [PanemuTableComponent, PanemuPaginationComponent, PanemuQueryComponent, PanemuSettingComponent],
  standalone: true,
  styleUrl: 'persist-state.component.scss'
})

export class PersistStateComponent implements OnInit {
  sendEmailTemplate = viewChild<TemplateRef<any>>('sendEmailTemplate');
  actionCellTemplate = viewChild<TemplateRef<any>>('actionCellTemplate');
  countryFooter = viewChild<TemplateRef<any>>('countryFooter');
  clmAction: ComputedColumn = {
    type: ColumnType.COMPUTED,
    formatter: (val: any) => '',
    cellRenderer: DefaultCellRenderer.create(this.actionCellTemplate),
    expansion: { component: PeopleFormComponent },
    sticky: 'end',
    width: 80,
    resizable: false,
    cellStyle: (_: string) => 'border-left-color: rgba(0,0,0, .12); border-left-width: 1px; border-left-style: solid;'
  };

  columns = this.pts.buildColumns<People>([
    new TickColumnClass<People>(),
    { field: 'id', type: ColumnType.INT},
    { field: 'name' },
    {
      field: 'email', expansion: {
        component: this.sendEmailTemplate,
        isDisabled: (row) => {
          return row.country == 'Indonesia'
        },
      }
    },
    { field: 'gender', type: ColumnType.MAP, valueMap: { F: 'Female', M: 'Male' } },
    {
      field: 'country', type: ColumnType.MAP, valueMap: this.dataService.getCountryMap(),
      cellRenderer: FilterCountryCellComponent.create(this.onCountryFilterClick.bind(this)),
      rowGroupRenderer: DefaultRowGroupRenderer.create({ footerComponent: this.countryFooter })
    },
    { field: 'amount', type: ColumnType.DECIMAL },
    { field: 'enrolled', type: ColumnType.DATE },
    { field: 'last_login', type: ColumnType.DATETIME },
    { field: 'verified', type: ColumnType.MAP, valueMap: { true: 'Yes', false: 'No' } },
    this.clmAction,
  ]
  )
  datasource = new PanemuTableDataSource<People>;
  controller = PanemuTableController.create<People>(this.columns, this.datasource, { stateKey: 'PersistStateComponent' });

  constructor(private dataService: DataService, private pts: PanemuTableService) { }

  ngOnInit() {
    this.dataService.getPeople().subscribe(result => {
      this.datasource.setData(result);
      this.controller.reloadData();
    });

  }

  onCountryFilterClick(value: any, propName: string) {
    this.controller.criteria = [{ field: propName, value: value }]
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