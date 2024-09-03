import { Pipe, PipeTransform } from '@angular/core';

/**
 * Used to wrap `RowOptions.rowClass()` and `RowOptions.rowStyle` methods to get the benefit of angular pipe memoization.
 * It increase the table rendering performance 
 */
@Pipe({
  name: 'cellStyling',
  standalone: true
})
export class CellStylingPipe implements PipeTransform {
  transform(value: any, row: any, f?: Function): any {
    return f ? f(value, row) : ''
  }
}