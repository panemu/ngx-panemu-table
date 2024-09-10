import { Pipe, PipeTransform } from '@angular/core';
import { CellFormatter } from './cell';

/**
 * Used to render group row label to get the benefit of angular pipe memoization.
 * It increase the table rendering performance 
 */
@Pipe({
  name: 'groupCell',
  standalone: true
})
export class GroupCellPipe implements PipeTransform {
  transform(val: any, formatter: CellFormatter): any {
    return formatter(val)
  }
}