import { Pipe, PipeTransform } from '@angular/core';
import { PanemuTableEditingController } from '../editing/panemu-table-editing-controller';

/**
 * Used to wrap `BaseColumn.cellClass` methods to get the benefit of angular pipe memoization.
 * It increases table rendering performance.
 */
@Pipe({
  name: 'cellClass',
  standalone: true
})
export class CellClassPipe implements PipeTransform {
  transform(value: any, row: any, selected: boolean, columnKey: string, tableMode: string, editingController?: PanemuTableEditingController<any>, f?: Function): any {
    
    /**
     * The selected argument is included here to trigger this pipe when selected row is changed
     */
    
    let customStyle: string = f ? f(value, row) : '';
    if (tableMode != 'browse' && editingController) {
      let rowEditingInfo = editingController?._getEditingInfo(row);
      customStyle = rowEditingInfo?.editor[columnKey]?.isChanged() ? customStyle + ' data-changed' : customStyle;
      if (rowEditingInfo?.editor[columnKey]?.errorMessage()) {
        customStyle = customStyle + ' ng-invalid';
      }
    };
    
    return customStyle.trim();
  }
}