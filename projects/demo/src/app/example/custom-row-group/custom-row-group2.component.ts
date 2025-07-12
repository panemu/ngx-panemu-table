import { Component, inject, OnInit, ViewEncapsulation } from '@angular/core';
import {
  ColumnType,
  GroupCellPipe,
  PanemuQueryComponent,
  PanemuTableComponent,
  PanemuTableController,
  PanemuTableDataSource,
  PanemuTableService,
  RowGroup,
  RowGroupFooter,
  TableQuery
} from 'ngx-panemu-table';
import { tap } from 'rxjs';
import { People } from '../../model/people';
import { DataService } from '../../service/data.service';
import { CountryRowGroupFooter } from './country-row-group-footer.component';
import { CountryRowGroup } from './country-row-group.component';

@Component({
    imports: [PanemuTableComponent, PanemuQueryComponent, GroupCellPipe],
    templateUrl: './custom-row-group2.component.html',
    styleUrl: './custom-row-group.component.scss',
    encapsulation: ViewEncapsulation.None
})
export class CustomRowGroup2Component implements OnInit {

  pts = inject(PanemuTableService);

  dataService = inject(DataService);
  columns = this.pts.buildColumns<People>([
    { field: 'id' },
    { field: 'name' },
    { field: 'gender', type: ColumnType.MAP, valueMap: {M: 'Male', F: 'Female'} },
    {
      field: 'country', type: ColumnType.MAP, valueMap: this.dataService.getCountryMap(), visible: false,
      rowGroupRenderer: { component: CountryRowGroup, footerComponent: CountryRowGroupFooter, parameter: { alwaysExpanded: true } }
    },
    { field: 'verified' },
    { field: 'amount', type: ColumnType.DECIMAL },
    { field: 'enrolled', type: ColumnType.DATE },
    { field: 'last_login', type: ColumnType.DATETIME },
    { field: 'email' },
  ],
    //disable grouping for all columns
    {
      groupable: false

    })

  datasource = new PanemuTableDataSource<People>;
  controller = PanemuTableController.createWithCustomDataSource<People>(this.columns, this.loadData.bind(this), {virtualScroll: true, virtualScrollRowHeight: 32});

  ngOnInit(): void {
    this.dataService.getPeople().subscribe(result => {
      this.datasource.setData(result);
      this.controller.reloadData();
    })
  }

  private loadData(startIndex: number, maxRows: number, tableQuery: TableQuery) {
    maxRows = 0;//disable pagination. Retrieve all data.
    return this.datasource.getData(startIndex, maxRows, tableQuery).pipe(
      tap(tableData => {

        /**
         * Manual grouping by country
         */

        const countryMap: { [key: string]: People[] } = {};
        const allAdata = tableData.rows as People[];
        for (const people of allAdata) {
          if (!countryMap[people.country || '']) {
            countryMap[people.country || ''] = [];
          }
          countryMap[people.country || ''].push(people);
        }
        const newRows: any[] = [];
        const countryColumn = this.columns.body.find(item => item.field == 'country')!;
        Object.keys(countryMap).forEach(country => {
          const rowGroup = new RowGroup(countryColumn, { value: country, count: countryMap[country].length });
          newRows.push(rowGroup);
          newRows.push(...countryMap[country])
          newRows.push(new RowGroupFooter(rowGroup))
        })
        tableData.rows = newRows;
        tableData.totalRows = newRows.length;
      })
    );
  }

}
