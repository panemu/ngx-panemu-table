import { Pipe, PipeTransform } from '@angular/core';
import { CellFormatter, PropertyColumn } from 'ngx-panemu-table';

const tagsToReplace: any = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;'
};

@Pipe({
  name: 'highlight',
  standalone: true
})
export class HighlightPipe implements PipeTransform {


  /**
   * Some of unused parameters here are actually used for Angular pipe memoization
   * @param value 
   * @param row 
   * @param column 
   * @param formatter 
   * @param valueMap 
   * @param searchTerm 
   * @returns 
   */
  transform(value: any, row?: any, column?: PropertyColumn<any>, formatter?:CellFormatter, valueMap?: any, searchTerm?: string): any {
    if (column?.formatter) {
      value = column.formatter!(value, row, column)
    }

    if (value === undefined || value === '') {
      return value;
    }

    value = value + '';
    value = safe_tags_replace(value);//escape html tags

    if (!searchTerm) {
      return value;
    }
    
    const regex = new RegExp(searchTerm, 'gi');
    try {

      const match = value.match(regex);
      
      if (!match) {
        return value;
      }
      
      return value.replace(regex, `<span class='highlight'>${match[0]}</span>`);
    } catch (e) {
      console.log('error on value', value)
      console.error(e)
      return value
    }
  }
}

function replaceTag(tag: string) {
  return tagsToReplace[tag] || tag;
}

function safe_tags_replace(str: string) {
  return str.replace(/[&<>]/g, replaceTag);
}