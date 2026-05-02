import { Component, inject, OnInit, TemplateRef, viewChild } from '@angular/core';
import { DefaultCellRenderer, PanemuPaginationComponent, PanemuQueryComponent, PanemuTableComponent, PanemuTableController, PanemuTableDataSource, PanemuTableService, Predicate } from 'ngx-panemu-table';
import { People } from '../../model/people';
import { DataService } from '../../service/data.service';
import { FilterCountryCellComponent } from './filter-country-cell.component';

@Component({
    selector: 'pnm-custom-cell',
    templateUrl: 'custom-cell.component.html',
    imports: [PanemuTableComponent, PanemuPaginationComponent, PanemuQueryComponent],
    styleUrl: 'custom-cell.component.scss'
})

export class CustomCellComponent implements OnInit {
  genderCellTemplate = viewChild<TemplateRef<any>>('genderCellTemplate');
  actionCellTemplate = viewChild<TemplateRef<any>>('actionCellTemplate');
  pts = inject(PanemuTableService);
  dataService = inject(DataService);
  columns = this.pts.buildColumns<People>([
    { field: 'id'},
    { field: 'name' },
    { field: 'gender', cellRenderer: DefaultCellRenderer.create(this.genderCellTemplate) },
    { 
      field: 'country', 
      cellRenderer: FilterCountryCellComponent.create(this.onCountryFilterClick.bind(this)),
      type: 'map',
      valueMap: this.dataService.getCountryMap()
    },
    { field: 'amount', type: 'decimal' },
    { field: 'email' },
    { field: 'enrolled', type: 'date' },
    { field: 'last_login', type: 'datetime' },
    {
      type: 'computed',
      formatter: (val: any) => '',
      cellRenderer: DefaultCellRenderer.create(this.actionCellTemplate),
      sticky: 'end',
      resizable: false
    },
  ])
  datasource = new PanemuTableDataSource<People>;
  controller = PanemuTableController.create<People>(this.columns, this.datasource);

  ngOnInit() {
    // this.controller.groupByColumns = [{field: 'country'}]
    this.dataService.getPeople().subscribe(result => {
      this.datasource.setData(result);
      this.controller.reloadData();
    })
  }

  onCountryFilterClick(value: any, propName: string) {
    this.controller.criteria = { field: propName, value: value, type: 'eq' } as Predicate;
    this.controller.reloadData();
  }

  edit(row: People) {
    alert('Edit ' + JSON.stringify(row))
  }
  
  delete(row: People) {
    alert('Delete ' + JSON.stringify(row))
    
  }

}