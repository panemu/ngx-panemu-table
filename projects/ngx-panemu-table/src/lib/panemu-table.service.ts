import { formatDate, formatNumber } from '@angular/common';
import { Inject, Injectable, isSignal, LOCALE_ID, signal, Signal } from '@angular/core';
import { CellFormatter } from './cell/cell';
import { DefaultCellRenderer } from "./cell/default-cell-renderer";
import { DefaultHeaderRenderer } from './cell/default-header-renderer';
import { MapCellRenderer } from './cell/map-cell-renderer';
import { BaseColumn, Column, ColumnType, ComputedColumn, MapColumn, PropertyColumn } from './column/column';
import { DefaultColumnOptions } from './column/default-column-options';
import { TickColumnClass } from './column/tick-column-class';
import { LabelTranslation } from './option/label-translation';

@Injectable({
  providedIn: 'root'
})
export class PanemuTableService {

  DEFAULT_LABEL_TRANSLATION: LabelTranslation = {
    search: 'Search',
    loading: 'Loading...',
    day: 'Day',
    month: 'Month',
    year: 'Year',
    groupBy: 'Group By',
    noData: 'No data to display'
  };

  constructor(@Inject(LOCALE_ID) protected locale: string) { }

  /**
   * Build columns for the table. This method handle column initialization. The `options` argument is by default
   * taken from `PanemuTableService.getDefaultColumnOptions`
   * 
   * @param columns 
   * @param options 
   * @returns 
   */
  buildColumns<T>(columns: (Column<T> | MapColumn<T> | TickColumnClass<T> | ComputedColumn)[], options?: DefaultColumnOptions): BaseColumn<T>[] {
    const defaultOptions = this.getDefaultColumnOptions();
    if (options) {
      Object.assign(defaultOptions, options);
    }

    columns.forEach((item, index) => this.initColumn(item, index, defaultOptions))
    
    const indexMap: Record<string, number> = {};
    columns.forEach((item: any) => {
      const propColumn = item as PropertyColumn<any>;
      const field = propColumn.field.toString();
      const keyCount = indexMap[field] || 0;
      propColumn.__key = `${field}_${keyCount}`;
      indexMap[field] = keyCount + 1;
    })
    return columns;
  }

  private initColumn(baseColumn: BaseColumn<any>, index: number, defaultOptions: DefaultColumnOptions) {

    if ((baseColumn as PropertyColumn<any>).field) {
      let column = baseColumn as PropertyColumn<any>;

      column.label = column.label || this.toTitleCase(column.field.toString());
      column.groupable = column.groupable === undefined ? defaultOptions.groupable : column.groupable;
      column.sortable = column.sortable === undefined ? defaultOptions.sortable : column.sortable;
      column.filterable = column.filterable === undefined ? defaultOptions.filterable : column.filterable;
      // column.groupByField = column.groupByField as string || column.field;
      column.type = column.type;

      if (!column.formatter) {
        switch (column.type) {
          case ColumnType.INT:
            column.formatter = this.getIntCellFormatter();
            column.cellClass = column.cellClass || (() => 'number-cell')
            break;
          case ColumnType.DECIMAL:
            column.formatter = this.getDecimalCellFormatter();
            column.cellClass = column.cellClass || (() => 'number-cell')

            break;
          case ColumnType.DATETIME:
            column.formatter = this.getDateTimeCellFormatter();
            break;
          case ColumnType.DATE:
            column.formatter = this.getDateCellFormatter();
            break;
          case ColumnType.MAP:
            const mapColumn = (<MapColumn<any>>column);
            if (!isSignal(mapColumn.valueMap)) {
              mapColumn.valueMap = signal(mapColumn.valueMap);
            }
            column.formatter = this.getMapFormatter(mapColumn.valueMap as Signal<any>);
            if (!column.cellRenderer) {
              column.cellRenderer = {component: MapCellRenderer}
            }
            break;
          default:
            column.formatter = this.getDefaultCellFormatter();
        }
      } else {
        column.formatter = column.formatter;
      }
      
    } else if (baseColumn.type == ColumnType.TICK) {
      
      
      (baseColumn as any).field = '__tick_' + index;
      baseColumn.sticky = baseColumn.sticky === undefined ? 'start' : null;
    } else if (baseColumn.type == ColumnType.COMPUTED) {
      (baseColumn as any).field = '__computed_' + index;
    }
    baseColumn.resizable = baseColumn.resizable === undefined ? defaultOptions.resizable : baseColumn.resizable;
    baseColumn.width = baseColumn.width || 0;
    baseColumn.visible = baseColumn.visible === undefined ? defaultOptions.visible : baseColumn.visible;
    baseColumn.headerRenderer = baseColumn.headerRenderer || DefaultHeaderRenderer.create();
    
    baseColumn.cellRenderer = baseColumn.cellRenderer || DefaultCellRenderer.create();
    
  }

  private toTitleCase(str: string) {
    str = str.replaceAll('_', ' ');
    return str.split(' ').map(txt => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase()).join(' ');
  }

  /**
   * Get default cell formatter
   * @returns 
   */
  getDefaultCellFormatter(): CellFormatter {
    return (val: any) => {
      return val ?? '';
    }
  }

  /**
   * Get default formatter for ColumnType.DECIMAL
   * @returns 
   */
  getDecimalCellFormatter(): CellFormatter {
    return (val) => {
      return formatNumber(val, this.locale, '.2') || ''
    }
  }

  /**
   * Get default formatter for ColumnType.INT
   * @returns 
   */
  getIntCellFormatter(): CellFormatter {
    return (val: any) => val || '';
  }

  /**
   * Get default formatter for ColumnType.DATETIME. Default is `d MMM yyyy H:mm:ss`
   * @returns 
   */
  getDateTimeCellFormatter(): CellFormatter {
    return (val) => {
      
      return formatDate(val, 'd MMM yyyy H:mm:ss', this.locale) || ''
    }
  }

  /**
   * Get default formatter for ColumnType.DATE. Default is `EEE, d MMM yyyy`
   * @returns 
   */
  getDateCellFormatter(): CellFormatter {
    return (val) => {
      return formatDate(val, 'EEE, d MMM yyyy', this.locale) || ''
    }
  }

  getMapFormatter(map: Signal<{ [key: string]: any }>): CellFormatter {
    return (val: any) => {
      return (map as any)()[val] ?? val;
    }
  }

  /**
   * Get default formatter for GroupBy functionality where the column type is ColumnType.DATE or ColumnType.DATETIME
   * and the modifier is 'month'
   * @returns 
   */
  getMonthCellFormatter(): CellFormatter {
    return (val: any) => {
      if (val && (val + '').length <= 7) {
        val = val + '-01';
      }
      return formatDate(val, 'MMM yyyy', this.locale) || '';
    }
  }

  /**
   * Get default formatter for GroupBy functionality where the column type is ColumnType.DATE or ColumnType.DATETIME
   * and the modifier is 'year'
   * @returns 
   */
  getYearCellFormatter(): CellFormatter {
    return (val: any) => {
      if (val && (val + '').length <= 4) {
        val = val + '-01-01';
      }
      return formatDate(val, 'yyyy', this.locale) || '';
    }
  }

  /**
   * Get group modifier formatter.
   * @param modifier 
   * @returns 
   */
  getGroupModifierFormatter(modifier: string) {
    switch (modifier) {
      case 'month': return this.getMonthCellFormatter();
      case 'year': return this.getYearCellFormatter();
      case 'day': return this.getDateCellFormatter();
    }
    return this.getDefaultCellFormatter();
  }

  /**
   * Get label translation. Intended for internationalization.
   * @returns 
   */
  getLabelTranslation(): LabelTranslation {
    return this.DEFAULT_LABEL_TRANSLATION;
  }

  /**
   * Unspecified properties in `BaseColumn` use values returned by this method.
   * @returns 
   */
  getDefaultColumnOptions(): DefaultColumnOptions {
    return {
      visible: true,
      filterable: true,
      groupable: true,
      resizable: true,
      sortable: true
    }
  }
}
