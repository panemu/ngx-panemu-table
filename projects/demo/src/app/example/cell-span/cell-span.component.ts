import { Component, TemplateRef, viewChild, ViewEncapsulation } from '@angular/core';
import { CellFormatterPipe, CellStylingPipe, ColumnType, RowRenderer, PanemuPaginationComponent, PanemuTableComponent, PanemuTableController, PanemuTableDataSource, PanemuTableService, RowStylingPipe, TableData, TableQuery } from 'ngx-panemu-table';
import { People } from '../../model/people';
import { DataService } from '../../service/data.service';
import { map, Observable } from 'rxjs';
import { CommonModule } from '@angular/common';

interface People2 extends People {
  country_row_span: number;
  name_col_span: number;
  email_col_span: number;
}

@Component({
  selector: 'app-cell-span',
  standalone: true,
  imports: [PanemuTableComponent, PanemuPaginationComponent, CellStylingPipe, RowStylingPipe, CommonModule, CellFormatterPipe],
  templateUrl: './cell-span.component.html',
  styleUrl: './cell-span.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class CellSpanComponent {
  rowRenderer = viewChild<TemplateRef<RowRenderer<People2>>>('rowRenderer')
  columns = this.pts.buildColumns<People2>([
    { field: 'id', type: ColumnType.INT },
    { field: 'country', type: ColumnType.MAP, valueMap: this.dataService.getCountryMap() },
    { field: 'name', 
      cellStyle: (value, row) => row.name_col_span > 1 ? 'background-color: rgba(255,255,0, 0.5);' : '', 
    },
    { field: 'email' },
    { field: 'gender', type: ColumnType.MAP, valueMap: { F: "Female", M: "Male" } },
    { field: 'amount', type: ColumnType.DECIMAL },
    { field: 'enrolled', type: ColumnType.DATE },
    { field: 'last_login', type: ColumnType.DATETIME },
    { field: 'verified', type: ColumnType.MAP, valueMap: { true: 'Yes', false: 'No' } }
  ], {
    sortable: false
  })
  datasource = new PanemuTableDataSource<People>;
  controller = PanemuTableController.createWithCustomDataSource<People2>(this.columns, this.getData.bind(this),
    { rowOptions: { rowRenderer: this.rowRenderer }, autoHeight: true }
  );

  constructor(private dataService: DataService, private pts: PanemuTableService) { }

  ngOnInit() {
    this.controller.maxRows = 10;
    this.dataService.getPeople().subscribe(result => {
      this.datasource.setData(result);
      this.controller.reloadData();
    })
  }

  getData(start: number, maxRows: number, tableQuery: TableQuery): Observable<TableData<People2>> {
    tableQuery.sortingInfos = [{field: 'country', direction: 'asc'}];
    return this.datasource.getData(start, maxRows, tableQuery).pipe(
      map(tableData => {
        const countryMap: { [key: string]: People[] } = {};
        const allAdata = tableData.rows as People[];
        for (const people of allAdata) {
          if (!countryMap[people.country || '']) {
            countryMap[people.country || ''] = [];
          }
          countryMap[people.country || ''].push(people);
        }

        const people2: People2[] = [];
        Object.keys(countryMap).forEach(countryCode => {
          const people = countryMap[countryCode];
          for (let index = 0; index < people?.length; index++) {
            const country_row_span = index == 0 ? people.length : 0;
            const name_col_span = index == 0 ? 2 : 1;
            const email_col_span = index == 0 ? 0 : 1;
            people2.push({...people[index], country_row_span, email_col_span, name_col_span})
          }
        })
        const people2TableData: TableData<People2> = {
          rows: people2,
          totalRows: tableData.totalRows,
        }
        return people2TableData
      })
    );
  }
}
