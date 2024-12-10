import { CellFormatter } from "../cell/cell";
import { PropertyColumn } from "../column/column";
import { PanemuTableController } from "../panemu-table-controller";

/**
 * Grouping data interface returned by datasource when it returns row group information.
 * This data will be converted to `RowGroup` and be displayed in table.
 */
export interface RowGroupData {
  value: string
  count?: number
}

/**
 * Class for grouping data displayed in table.
 */
export class RowGroup {

  field!: string;
  level = 0;
  parent?: RowGroup;
  expanded = false;
  controller?: PanemuTableController<any>;
  formatter!: CellFormatter;
  modifier?: string;
  
  constructor(public column: PropertyColumn<any>, public data: RowGroupData) {
    this.field = column.field as string;
    this.formatter = column.formatter!;
  }


}

/**
 * Class for the footer of grouping data.
 */
export class RowGroupFooter {
  constructor(public rowGroup: RowGroup){}
}