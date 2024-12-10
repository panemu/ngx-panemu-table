import { map, of } from "rxjs";
import { BaseColumn, ColumnType, GroupedColumn, NonGroupColumn } from "../column/column";
import { PanemuTableController } from "../panemu-table-controller";
import { PanemuTableService } from "../panemu-table.service";
import { ColumnState, TableState } from "./table-states";

export class TableStateManager {

  constructor(private pts: PanemuTableService){}

  private convertColumnToTemplateColumn(clm: (GroupedColumn | NonGroupColumn<any>)) {
    if (clm.type == ColumnType.GROUP) {
      let result: ColumnState = {
        key: (clm as any)['__key'],
        children: [],
        visible: true
      };
      (clm as GroupedColumn).children.forEach(item => {
        result.children?.push(this.convertColumnToTemplateColumn(item as any));
      })
      return result;
    } else {
      let bc = clm as BaseColumn<any>
      const colState: ColumnState = {
        key: bc.__key!,
        sticky: bc.sticky,
        width: bc.width,
        visible: bc.visible!
      }
      return colState;
    }

  }

  getSavedTableState(key?: string, structureKey?: string) {
    if (!key || !structureKey) return of(null);

    return this.pts.getTableState(key).pipe(
      map(state => {
        if (state && state.structureKey != structureKey) {
          return null;
        }
        return state;
      })
    )
    
  }

  saveTableState(controller: PanemuTableController<any>) {
    if (!controller.tableOptions.stateKey) return;

    let columns: ColumnState[] = [];
    controller.columnDefinition.mutatedStructure.forEach(item => columns.push(this.convertColumnToTemplateColumn(item)))
    let state: TableState = {
      structureKey: controller.columnDefinition.structureKey,
      maxRows: controller.maxRows,
      startIndex: controller.startIndex,
      criteria: controller.criteria,
      groupByColumns: controller.groupByColumns,
      sorting: controller.sortedColumn,
      columns
    }

    this.pts.saveTableState(controller.tableOptions.stateKey!, state);
  }

  deleteTableState(key?: string) {
    if (key) {
      return this.pts.deleteTableState(key);
    }
    return of(null);
  }
}