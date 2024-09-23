import { CommonModule } from '@angular/common';
import { Component, TemplateRef, viewChild } from '@angular/core';
import { ColumnType, ComputedColumn, DefaultCellRenderer, PanemuTableComponent, PanemuTableController, PanemuTableDataSource, PanemuTableService } from 'ngx-panemu-table';
import { People } from '../model/people';
import { DataService } from '../service/data.service';
import { NestedTableComponent } from './custom-cell/nested-table.component';
import { PeopleFormComponent } from './custom-cell/people-form.component';

@Component({
  selector: 'app-row-detail',
  standalone: true,
  imports: [PanemuTableComponent, CommonModule],
  templateUrl: 'row-detail.component.html',
  styleUrl: 'row-detail.component.scss',
})
export class RowDetailComponent {
  sendEmailTemplate = viewChild<TemplateRef<any>>('sendEmailTemplate');
  actionCellTemplate = viewChild<TemplateRef<any>>('actionCellTemplate');
  deleteExpansionRow = viewChild<TemplateRef<any>>('deleteExpansionRow');

  private readonly clmEditInExpansion: ComputedColumn = {
    type: ColumnType.COMPUTED,
    formatter: (val: any) => '',
    expansion: { component: PeopleFormComponent },
    cellRenderer: DefaultCellRenderer.create(this.actionCellTemplate),
    sticky: 'end',
    cellStyle: (_) => 'border-left-color: rgba(0,0,0, .12); border-left-width: 1px; border-left-style: solid;'
  };

  columns = this.pts.buildColumns<People>([
    { field: 'id', },
    { field: 'name', },
    {
      field: 'email', expansion: {
        component: this.sendEmailTemplate,
        isDisabled: (row) => {
          return row.country == 'ID'
        },
        buttonPosition: 'end',
      }
    },
    {
      field: 'country', type: ColumnType.MAP, valueMap: this.dataService.getCountryMap(), expansion: {
        component: NestedTableComponent,
      }
    },

    this.clmEditInExpansion,
  ])
  datasource = new PanemuTableDataSource<People>();

  controller = PanemuTableController.create<People>(this.columns, this.datasource, {virtualScroll: true, virtualScrollRowHeight: 32, autoHeight: true});

  constructor(private pts: PanemuTableService,
    private dataService: DataService,
  ) { }

  ngOnInit() {
    this.dataService.getPeople().subscribe({
      next: people => {
        this.datasource.setData(people);
        this.controller.reloadData();
      }
    })
  }

  checkExpandDisabled(row: People) {
    return row.country == 'Indonesia'
  }

  edit(row: People) {
    this.clmEditInExpansion.expansion = { component: PeopleFormComponent };
    this.controller.expand(row, this.clmEditInExpansion)
  }

  deleteConfirmation(row: People) {
    this.clmEditInExpansion.expansion = { component: this.deleteExpansionRow };
    this.controller.expand(row, this.clmEditInExpansion)
  }

  doDelete(row: People) {
    const allData = this.datasource.getAllData();
    const idx = allData.indexOf(row);
    if (idx > -1) {
      allData.splice(idx, 1);
      this.datasource.setData(allData);
    }
    this.controller.reloadData();
  }

  editFirstRow() {
    this.edit(this.controller.getData()[0])
  }
}
