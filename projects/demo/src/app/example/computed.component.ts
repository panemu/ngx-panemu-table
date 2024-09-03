import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ColumnType, PanemuTableComponent, PanemuTableController, PanemuTableDataSource, PanemuTableService } from 'ngx-panemu-table';
import { People } from '../model/people';
import { DataService } from '../service/data.service';

@Component({
  selector: 'pnm-computed',
  templateUrl: 'computed.component.html',
  imports: [PanemuTableComponent],
  standalone: true,
  styles: `
    .panemu-table .computed2 {
      background-color: rgba(165, 42, 42, 0.7);
      color: white;
    }

    .panemu-table .center {
      text-align: center;
    }
  `,
  encapsulation: ViewEncapsulation.None
})
export class ComputedComponent implements OnInit {
  columns = this.pts.buildColumns<People>([
    { field: 'name' },
    { field: 'gender' },
    {
      type: ColumnType.COMPUTED,
      label: 'Gender - Country',
      formatter: (val: any, rowData?: any) => rowData['gender'] + ' - ' + rowData['country'],
      cellStyle: () => 'background-color: rgba(50,65,65, 0.7); color: white;'
    },
    { field: 'amount' },
    {
      type: ColumnType.COMPUTED,
      label: 'Computed (Amount / 2)',
      formatter: this.getCustomValue2.bind(this),
      cellClass: () => 'computed2 center'
    },
    { field: 'country' },
  ])
  private readonly datasource = new PanemuTableDataSource<People>;

  controller = PanemuTableController.create<People>(this.columns, this.datasource);

  constructor(private dataService: DataService, private pts: PanemuTableService) { }

  ngOnInit() {
    this.dataService.getPeople().subscribe(result => {
      this.datasource.setData(result);
      this.controller.reloadData();
    });
  }

  private getCustomValue2(val: any, rowData?: any) {
    return (rowData['amount'] / 2) + ''
  }
}