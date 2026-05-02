import { Type } from "@angular/core";
import { BaseColumn, LeafColumn } from "../column/column";

export type CellFormatter<T> = (val: any, rowData?: T, column?: BaseColumn<T>) => string;

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
  column: LeafColumn<T>

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
