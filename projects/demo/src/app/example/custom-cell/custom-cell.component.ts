import { Component, OnInit, TemplateRef, viewChild } from '@angular/core';
import { ColumnType, DefaultCellRenderer, PanemuPaginationComponent, PanemuQueryComponent, PanemuTableComponent, PanemuTableController, PanemuTableDataSource, PanemuTableService } from 'ngx-panemu-table';
import { People } from '../../model/people';
import { DataService } from '../../service/data.service';
import { FilterCountryCellComponent } from './filter-country-cell.component';

@Component({
  selector: 'pnm-custom-cell',
  templateUrl: 'custom-cell.component.html',
  imports: [PanemuTableComponent, PanemuPaginationComponent, PanemuQueryComponent],
  standalone: true,
  styleUrl: 'custom-cell.component.scss'
})

export class CustomCellComponent implements OnInit {
  genderCellTemplate = viewChild<TemplateRef<any>>('genderCellTemplate');
  actionCellTemplate = viewChild<TemplateRef<any>>('actionCellTemplate');
  columns = this.pts.buildColumns<People>([
    { field: 'name' },
    { field: 'gender', cellRenderer: DefaultCellRenderer.create(this.genderCellTemplate) },
    { field: 'country', cellRenderer: FilterCountryCellComponent.create(this.onCountryFilterClick.bind(this)) },
    { field: 'amount', type: ColumnType.DECIMAL },
    { field: 'email' },
    { field: 'enrolled', type: ColumnType.DATE },
    { field: 'last_login', type: ColumnType.DATETIME },
    {
      type: ColumnType.COMPUTED,
      formatter: (val: any) => '',
      cellRenderer: DefaultCellRenderer.create(this.actionCellTemplate),
      sticky: 'end'
    },
  ])
  datasource = new PanemuTableDataSource<People>;
  controller = PanemuTableController.create<People>(this.columns, this.datasource);

  constructor(private dataService: DataService, private pts: PanemuTableService) { }

  ngOnInit() {
    this.dataService.getPeople().subscribe(result => {
      this.datasource.setData(result);
      this.controller.reloadData();
    })
  }

  onCountryFilterClick(value: any, propName: string) {
    this.controller.criteria = [{ field: propName, value: value }]
    this.controller.reloadData();
  }

  edit(row: People) {
    alert('Edit ' + JSON.stringify(row))
  }
  
  delete(row: People) {
    alert('Delete ' + JSON.stringify(row))
    
  }

}