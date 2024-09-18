import { Component, Input } from '@angular/core';
import { CellComponent, CellFormatterPipe, CellRenderer, PropertyColumn } from 'ngx-panemu-table';

type onClick<T> = (value: any, field: string, row?: T) => void;

@Component({
  templateUrl: 'filter-country-cell.component.html',
  standalone: true,
  imports: [CellFormatterPipe]
})

export class FilterCountryCellComponent<T> implements CellComponent<T> {
  row!: T;
  column!: PropertyColumn<T>;
  parameter?: { onClick: onClick<T> };

  click() {
    this.parameter?.onClick(this.row[this.column.field], this.column.field.toString(), this.row);
  }

  static create<T>(onClick: onClick<T>): CellRenderer {
    return {
      component: FilterCountryCellComponent,
      parameter: { onClick }
    }
  }
}