import { Component, inject, OnInit, TemplateRef, viewChild } from '@angular/core';
import { ColumnType, 
  PanemuQueryComponent, 
  DefaultRowGroupRenderer,
  PanemuTableComponent, 
  PanemuTableController, 
  PanemuTableDataSource, 
  PanemuTableService, 
  GroupCellPipe,
  TableQuery} from 'ngx-panemu-table';
import { People } from '../../model/people';
import { DataService } from '../../service/data.service';
import { CountryRowGroup } from './country-row-group.component';
import { tap } from 'rxjs';
import { BooleanRowGroupContentComponent } from './boolean-row-group-content.component';

@Component({
  selector: 'app-custom-row-group',
  standalone: true,
  imports: [PanemuTableComponent, PanemuQueryComponent, GroupCellPipe],
  templateUrl: './custom-row-group.component.html',
  styleUrl: './custom-row-group.component.scss'
})
export class CustomRowGroupComponent implements OnInit {
  
  pts = inject(PanemuTableService);
  genderGroupTemplate = viewChild<TemplateRef<any>>('genderGroupTemplate');

  dataService = inject(DataService);
  columns = this.pts.buildColumns<People>([
    { field: 'id' },
    { field: 'name' },
    { field: 'gender', rowGroupRenderer: DefaultRowGroupRenderer.create({contentRenderer: this.genderGroupTemplate, showPagination: false})},
    { field: 'country', type: ColumnType.MAP, valueMap: this.dataService.getCountryMap(), rowGroupRenderer: {component: CountryRowGroup} },
    { field: 'verified', rowGroupRenderer: DefaultRowGroupRenderer.create({contentRenderer: BooleanRowGroupContentComponent}) },
    { field: 'amount', type: ColumnType.DECIMAL },
    { field: 'enrolled', type: ColumnType.DATE },
    { field: 'last_login', type: ColumnType.DATETIME },
    { field: 'email' },
  ])

  datasource = new PanemuTableDataSource<People>;
  controller = PanemuTableController.createWithCustomDataSource<People>(this.columns, this.loadData.bind(this));

  ngOnInit(): void {
    this.dataService.getPeople().subscribe(result => {
      this.datasource.setData(result);
      this.defaultRowGroup();
    })
  }

  private loadData(startIndex: number, maxRows: number, tableQuery: TableQuery) {
    return this.datasource.getData(startIndex, maxRows, tableQuery).pipe(
      tap(tableData => {
        if (tableQuery.groupBy?.field == 'country') {
          const totalMap: {[key: string]: number} = {};
          const allAdata = this.datasource.getAllData();
          for (const people of allAdata) {
            if (people.country) {
              totalMap[people.country] = totalMap[people.country] ? totalMap[people.country] + people.amount : people.amount;
            }
          }
          for (const item of tableData.rows) {
            const group = item as any;
            group['average'] = totalMap[group.value]/group.count;
          }
        }
      })
    );
  }

  defaultRowGroup() {
    this.controller.groupByColumns = [{ field: 'enrolled', modifier:'month' }]
    this.controller.reloadData()
  }

  customRowGroupTemplate() {
    this.controller.groupByColumns = [{ field: 'gender' }]
    this.controller.reloadData()
  }

  customRowGroupComponent() {
    this.controller.groupByColumns = [{ field: 'verified' }]
    this.controller.reloadData()
  }

  customRowGroup(){
    this.controller.groupByColumns = [{ field: 'country'}]
    this.controller.reloadData()
  }
}
