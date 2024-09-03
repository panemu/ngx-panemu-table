import { Pipe, PipeTransform } from '@angular/core';
import { PropertyColumn } from '../column/column';

/**
 * Used to wrap `Column.formatter` method to get the benefit of angular pipe memoization.
 * It increase the table rendering performance 
 */
@Pipe({
  name: 'genericCell',
  standalone: true
})
export class GenericCellPipe implements PipeTransform {
  transform(val: any, row?: any, column?: PropertyColumn<any>): any {
    if (column?.formatter) {
      return column.formatter!(val, row, column);
    }
    return val;
  }
}