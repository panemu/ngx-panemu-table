import { CellFormatter } from "../cell/cell";
import { BaseColumn } from "../column/column";
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
  data!: RowGroupData;
  level = 0;
  parent?: RowGroup;
  expanded = false;
  column!: BaseColumn<any>;
  controller?: PanemuTableController<any>;
  formatter!: CellFormatter;
  modifier?: string;

}