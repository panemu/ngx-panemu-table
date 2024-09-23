import { Component, OnInit, signal } from '@angular/core';
import { ColumnType, PanemuTableComponent, PanemuTableController, PanemuTableDataSource, PanemuTableService } from 'ngx-panemu-table';

interface Data { gender: string }

const DATA: Data[] = [
  { "gender": "F" },
  { "gender": "F" },
  { "gender": "M" },
  { "gender": "M" },
  { "gender": "F" }
]

@Component({
  templateUrl: 'map-column.component.html',
  imports: [PanemuTableComponent],
  standalone: true
})

export class MapColumnComponent implements OnInit {
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
  ])

  controller = PanemuTableController.create(this.columns, new PanemuTableDataSource(DATA), {autoHeight: true});

  constructor(private pts: PanemuTableService) { }

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