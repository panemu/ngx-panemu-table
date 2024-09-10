import { CellFormatter } from "../cell/cell";
import { BaseColumn } from "../column/column";
import { PanemuTableController } from "../panemu-table-controller";

export class RowGroup {
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