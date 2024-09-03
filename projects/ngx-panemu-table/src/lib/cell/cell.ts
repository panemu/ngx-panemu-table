import { Type } from "@angular/core";
import { BaseColumn, PropertyColumn } from "../column/column";

export type CellFormatter = (val: any, rowData?: any, column?: BaseColumn<any>) => string;

export interface CellComponent<T> {
  // value: any;
  // property: string;
  row: T;
  column: PropertyColumn<T>
  parameter?: any;
  // formatter?: CellFormatter;
}

export interface CellRenderer {
  component: Type<CellComponent<any>>,
  parameter?: any;
}
