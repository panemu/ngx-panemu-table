import { Component, inject, OnInit, Signal, signal } from '@angular/core';
import { ColumnType, MapColumn, PanemuTableComponent, PanemuTableController, PanemuTableDataSource, PanemuTableService } from 'ngx-panemu-table';

interface Data { gender?: string }

const DATA: Data[] = [
  { "gender": "F" },
  {  },
  { "gender": "M" },
  { "gender": "M" },
  { "gender": "F" }
]

@Component({
    templateUrl: 'map-column.component.html',
    imports: [PanemuTableComponent]
})

export class MapColumnComponent implements OnInit {
  pts = inject(PanemuTableService);
  genderMap = signal<any>({});

  columns = this.pts.buildColumns<Data>([
    { field: 'gender', label: 'Regular Column' },
    {
      field: 'gender',
      type: ColumnType.MAP,
      valueMap: { F: 'Female', M: 'Male' },
      label: 'Map'
    },
    {
      field: 'gender',
      type: ColumnType.MAP,
      label: 'Signal of Map',
      valueMap: this.genderMap
    },
    {
      field: 'gender',
      type: ColumnType.MAP,
      label: 'Custom Formatter',
      valueMap: this.genderMap,
      formatter: (val, rowData, column) => {
        const mapColumn = column as MapColumn<Data>;
        const formattedValue = (mapColumn.valueMap as Signal<string>)()[val]
        return formattedValue ? val + ' - ' + formattedValue : val;
      }
    },
  ])

  controller = PanemuTableController.create(this.columns, new PanemuTableDataSource(DATA), {autoHeight: true});

  ngOnInit() {
    this.controller.reloadData();
    setTimeout(() => {
      this.genderMap.set({ F: 'Girl', M: 'Boy' });
    }, 2000);
  }

  boyGirl() {
    this.genderMap.set({ F: 'Girl', M: 'Boy' })
  }

  manWoman() {
    this.genderMap.set({ F: 'Woman', M: 'Man' })
  }

}