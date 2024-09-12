import { Pipe, PipeTransform } from '@angular/core';
import { PropertyColumn } from '../column/column';
import { CellFormatter } from './cell';

/**
 * Used to wrap `Column.formatter` method to get the benefit of angular pipe memoization.
 * It increase the table rendering performance.
 * 
 * The content of the cell will only be updated if any of the value, row, column or formatter
 * parameters are changed.
 */
@Pipe({
  name: 'genericCell',
  standalone: true
})
export class GenericCellPipe implements PipeTransform {

  /**
   * The content of the cell will only be updated if any of the value, row, column or formatter
   * parameters are changed.
   * The formatter parameter is actually from the column. However, if the formatter parameter
   * is not included in the arguments, changing the formatter won't trigger cell refresh.
   * @param val 
   * @param row 
   * @param column 
   * @param formatter formatter from `PropertyColumn.formatter`. It is included to trigger cell refresh when formatter is changed.
   * @returns 
   */
  transform(val: any, row?: any, column?: PropertyColumn<any>, formatter?:CellFormatter): any {
    if (column?.formatter) {
      return column.formatter!(val, row, column);
    }
    return val;
  }
}