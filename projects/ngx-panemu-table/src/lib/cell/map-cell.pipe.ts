import { Pipe, PipeTransform } from '@angular/core';
import { MapColumn } from '../column/column';

/**
 * Used to wrap `Column.formatter` method to get the benefit of angular pipe memoization.
 * It increase the table rendering performance 
 */
@Pipe({
  name: 'mapCell',
  standalone: true
})
export class MapCellPipe implements PipeTransform {
  transform(val: any, row?: any, column?: MapColumn<any>, valueMap?: any): any {
    if (column?.formatter) {
      return column.formatter!(val, row, column);
    }
    return val;
  }
}