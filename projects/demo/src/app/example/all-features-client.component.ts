import { Component, OnInit, signal, TemplateRef, viewChild } from '@angular/core';
import { ColumnType, ComputedColumn, DefaultCellRenderer, DefaultRowGroupRenderer, PanemuPaginationComponent, PanemuQueryComponent, PanemuTableComponent, PanemuTableController, PanemuTableDataSource, PanemuTableService, TickColumnClass } from 'ngx-panemu-table';
import { People } from '../model/people';
import { DataService } from '../service/data.service';
import { FilterCountryCellComponent } from './custom-cell/filter-country-cell.component';
import { PeopleFormComponent } from './custom-cell/people-form.component';

@Component({
  templateUrl: 'all-features-client.component.html',
  imports: [PanemuTableComponent, PanemuPaginationComponent, PanemuQueryComponent],
  standalone: true,
  styleUrl: 'all-features-client.component.scss'
})

export class AllFeaturesClientComponent implements OnInit {
  genderMap = signal({});
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
    new TickColumnClass<People>({ width: 50 }),
    { field: 'id', type: ColumnType.INT, width: 50},
    { field: 'name', width: 150 },
    {
      field: 'email', width: 230, expansion: {
        component: this.sendEmailTemplate,
        isDisabled: (row) => {
          return row.country == 'Indonesia'
        },
      }
    },
    { field: 'gender', width: 80, type: ColumnType.MAP, valueMap: this.genderMap },
    {
      field: 'country', width: 150, type: ColumnType.MAP, valueMap: this.dataService.getCountryMap(),
      cellRenderer: FilterCountryCellComponent.create(this.onCountryFilterClick.bind(this)),
      rowGroupRenderer: DefaultRowGroupRenderer.create({ footerComponent: this.countryFooter })
    },
    { field: 'amount', width: 100, type: ColumnType.DECIMAL },
    {
      type: ColumnType.GROUP, label: 'Date Info', children: [
        { field: 'enrolled', width: 150, type: ColumnType.DATE },
        { field: 'last_login', width: 180, type: ColumnType.DATETIME },
      ]
    },
    { field: 'verified', width: 80, type: ColumnType.MAP, valueMap: { true: 'Yes', false: 'No' } },
    this.clmAction,
  ]
  )
  datasource = new PanemuTableDataSource<People>;
  controller = PanemuTableController.create<People>(this.columns, this.datasource);

  constructor(private dataService: DataService, private pts: PanemuTableService) { }

  ngOnInit() {
    //set initial grouping
    this.controller.groupByColumns = [{ field: 'country' }]

    //set inital filtering
    this.controller.criteria = [{ field: 'verified', value: 'true' }]

    this.dataService.getPeople().subscribe(result => {
      this.datasource.setData(result);
      this.controller.reloadData();
    });

    //pretend genderMap is taken from server data
    setTimeout(() => {
      this.genderMap.set({ F: 'Female', M: 'Male' })
    }, 1000);
  }

  onCountryFilterClick(value: any, propName: string) {
    this.controller.criteria = [{ field: propName, value: value }]
    this.controller.reloadData();
  }

  edit(row: People) {
    this.controller.expand(row, this.clmAction)
  }

  delete(row: People) {
    alert('Delete ' + JSON.stringify(row))

  }

  exportCsv() {
    /**
     * The getCsvData() can accept parameter to exclude header or row group.
     * {includeRowGroup: false, includeHeader: false}
     */
    const csvString = this.controller.getCsvData();

    const dl = "data:text/csv;charset=utf-8," + csvString;
    window.open(encodeURI(dl))
  }

}