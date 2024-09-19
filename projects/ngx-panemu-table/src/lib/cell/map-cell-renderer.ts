import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MapColumn } from '../column/column';
import { CellComponent } from './cell';
import { MapCellPipe } from './map-cell.pipe';

@Component({
  template:'{{row[column.field] | mapCell:row:column:$any(column.valueMap)()}}',
  standalone: true,
  imports: [CommonModule, MapCellPipe]
})
export class MapCellRenderer implements CellComponent<any> {
  row!: any;
  column!: MapColumn<any>
}