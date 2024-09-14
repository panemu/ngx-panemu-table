import { CellFormatter } from "../cell/cell";
import { BaseColumn } from "../column/column";
import { PanemuTableController } from "../panemu-table-controller";

/**
 * Grouping data interface returned by datasource when it returns row group information.
 * This data will be converted to `RowGroup` and be displayed in table.
 */
export interface RowGroupModel {
  value: string
  count: number
}

/**
 * Class for grouping data displayed in table.
 */
export class RowGroup implements RowGroupModel {
  field!: string;
  level = 0;
  parent?: RowGroup;
  expanded = false;
  count = 0;
  value = '';
  column!: BaseColumn<any>;
  controller?: PanemuTableController<any>;
  formatter!: CellFormatter;
  modifier?: string;
  
  get visible(): boolean {
    return !this.parent || (this.parent.visible && this.parent.expanded);
  }

}