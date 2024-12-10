import { Pipe, PipeTransform } from "@angular/core";
import { PanemuTableEditingController } from "../editing/panemu-table-editing-controller";

@Pipe({
  name: 'cellDataChanged',
  standalone: true
})
export class CellDataChangedPipe implements PipeTransform {
  transform(row: any, rowSelected: boolean, columnKey: string, tableMode: string, editingController?: PanemuTableEditingController<any>): any {
    console.log('cellDataChanged pipe called')
    if (tableMode == 'browse') return false;
    if (!editingController) return false;
    let rowEditingInfo = editingController?._getEditingInfo(row);
    return rowEditingInfo?.editor[columnKey]?.isChanged() ?? false;
  }
}