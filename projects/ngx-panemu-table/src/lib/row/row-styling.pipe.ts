import { Pipe, PipeTransform } from '@angular/core';

/**
 * Used to wrap `RowOptions.rowClass()` and `RowOptions.rowStyle` methods to get the benefit of angular pipe memoization.
 * It increase the table rendering performance 
 */
@Pipe({
  name: 'rowStyling',
  standalone: true
})
export class RowStylingPipe implements PipeTransform {
  transform(row: any, f?: Function): any {
    return f ? f(row) : ''
  }
}