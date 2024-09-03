import { Component, OnInit } from '@angular/core';
import { CellComponent, CellRenderer, CellRendererDirective, PropertyColumn } from 'ngx-panemu-table';

type onClick<T> = (value: any, field: string, row?: T) => void;

@Component({
  templateUrl: 'filter-country-cell.component.html',
  standalone: true
})

export class FilterCountryCellComponent<T> implements CellComponent<T> {
  row!: T;
  rowIndex!: number;
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