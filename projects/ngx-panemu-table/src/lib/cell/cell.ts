import { Type } from "@angular/core";
import { BaseColumn, PropertyColumn } from "../column/column";

export type CellFormatter = (val: any, rowData?: any, column?: BaseColumn<any>) => string;

/**
 * Interface for custom cell renderer component.
 */
export interface CellComponent<T> {

  /**
   * This property contains row data.
   */
  row: T;

  /**
   * This property contains column data.
   */
  column: PropertyColumn<T>

  /**
   * This property contains custom parameter.
   */
  parameter?: any;
}

/**
 * Interface to specify `BaseColumn.cellRenderer`.
 */
export interface CellRenderer {
  component: Type<CellComponent<any>>,
  parameter?: any;
}
