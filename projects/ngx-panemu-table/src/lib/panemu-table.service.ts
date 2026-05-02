import { formatDate, formatNumber } from '@angular/common';
import { Inject, Injectable, isSignal, LOCALE_ID, signal, Signal, WritableSignal } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HeaderRenderer } from '../public-api';
import { CellFormatter } from './cell/cell';
import { DefaultCellRenderer } from "./cell/default-cell-renderer";
import { DefaultHeaderRenderer } from './cell/default-header-renderer';
import { ExpansionCellRenderer } from './cell/expansion-cell-renderer';
import { TickCellComponent } from './cell/tick-cell-renderer';
import { TickHeaderRenderer } from './cell/tick-header-renderer';
import { BaseColumn, Column, ColumnDefinition, ComputedColumn, GroupedColumn, HeaderRow, LeafColumn, MapColumn, PropertyColumn, TickColumn } from './column/column';
import { DefaultColumnOptions } from './column/default-column-options';
import { DEFAULT_LABEL_TRANSLATION } from './option/default-label-translation';
import { LabelTranslation } from './option/label-translation';
import { TableOptions } from './option/options';
import { TableState } from './state/table-states';
import { generateStructureKey, mergeDeep } from './util';

const GROUP_KEY_PREFIX = 'group_';

/**
 * The main purpose of this class is to [build columns](/api/classes/panemu/PanemuTableService#buildcolumns)
 * to be rendered in the table. It provide various default setting such as label translation, pagination
 * setting, default format for number or date etc. Those setting can be overriden globally so within one app,
 * all tables will use the same setting.
 * 
 * It also provide [editing](/api/classes/panemu/PanemuTableEditingController) and [query](/api/classes/panemu/PanemuQueryComponent)
 * functionality.
 */
@Injectable({
  providedIn: 'root'
})
export class PanemuTableService {

  /**
   * The locale parameter is used by default number and date format.
   * @param locale injected LOCALE_ID from angular framework. It is used for default number and date format.
   */
  constructor(@Inject(LOCALE_ID) protected locale: string) { }


  /**
   * Build columns for the table. This method handle column initialization. The `options` argument is by default
   * taken from `PanemuTableService.getColumnOptions`
   * 
   * @param columns columns to be displayed in table
   * @param options any specified value will override `PanemuTableService.getColumnOptions`.
   * @returns 
   */
  buildColumns<T>(columns: (GroupedColumn<T> | Column<T> | MapColumn<T> | TickColumn<T> | ComputedColumn<T>)[], options?: DefaultColumnOptions): ColumnDefinition<T> {
    const defaultOptions = this.getColumnOptions();
    if (options) {
      mergeDeep(defaultOptions, options);
    } else {
      options = defaultOptions;
    }

    let bodyColumns = this.buildBody(columns);
    this.initColumns(bodyColumns, defaultOptions);
    let headerRows: HeaderRow[] = [];
    this.buildHeaders(headerRows, columns, 0, this.getDepth(columns, 0), signal(0));

    return {
      structureKey: generateStructureKey(columns),
      header: headerRows,
      body: bodyColumns as PropertyColumn<T>[],
      mutatedStructure: columns,
      __tableService: this
    }
  }

  private rebuildColumnDefinition(columnDef: ColumnDefinition<any>) {
    /**
     * This method is used by PanemuTableController.
     * Marked as private to avoid usage by developer
     */
    let bodyColumns = this.buildBody(columnDef.mutatedStructure);
    let headerRows: HeaderRow[] = [];
    this.buildHeaders(headerRows, columnDef.mutatedStructure, 0, this.getDepth(columnDef.mutatedStructure, 0), signal(0));
    columnDef.header = headerRows;
    columnDef.body = bodyColumns as PropertyColumn<any>[];
  }

  private buildBody<T>(headers: (GroupedColumn<T> | LeafColumn<T>)[]) {
    let columns: BaseColumn<T>[] = [];
    for (const h of headers) {
      if (h.type !== 'group') {
        columns.push(h)
      } else {
        columns = columns.concat(this.buildBody((h as GroupedColumn<T>).children))
      }
    }

    return columns;
  }

  private buildHeaders<T>(wholeResult: HeaderRow[], headers: (GroupedColumn<T> | LeafColumn<T>)[],
    level: number,
    totalDepth: number,
    groupIndex: WritableSignal<number>,
    defaultOptions?: Required<DefaultColumnOptions>
  ) {

    if (!wholeResult[level]) {
      wholeResult[level] = { cells: [] };
    }
    let colSpan = 0;

    for (const h of headers) {
      if (h.type == 'group') {
        const clmGroup = h as GroupedColumn<T>;
        clmGroup.headerRenderer = clmGroup.headerRenderer ?? defaultOptions?.headerRenderer ?? this.getDefaultHeaderRenderer();
        let groupDepth = this.getDepth(clmGroup.children, 0);
        let groupRowSpan = totalDepth - groupDepth - level;
        let currentGroupIndex = groupIndex();
        groupIndex.update(i => i + 1);
        let childrenColSpan = this.buildHeaders(wholeResult, clmGroup.children, level + groupRowSpan, totalDepth, groupIndex, defaultOptions);

        if (childrenColSpan) {
          let groupHeader: BaseColumn<any> = {
            ...clmGroup,
            __colSpan: childrenColSpan,
            __rowSpan: groupRowSpan,
            __isGroup: true,
            __key: GROUP_KEY_PREFIX + currentGroupIndex,
          }
          clmGroup.__key = groupHeader.__key;
          wholeResult[level].cells.push(groupHeader)
          colSpan += childrenColSpan;
        }

      } else {
        if (h.visible) {

          let leafHeader = h as BaseColumn<any>;
          leafHeader.__colSpan = 1;
          leafHeader.__rowSpan = totalDepth - level;
          leafHeader.__isGroup = false;
          wholeResult[level].cells.push(leafHeader);
          colSpan++;
        }

      }
    }
    return colSpan;
    // return result;
  }

  private getDepth<T>(headers: (GroupedColumn<T> | LeafColumn<T>)[], level: number) {
    let depth = level + 1;
    for (const h of headers) {
      if (h.type == 'group') {
        depth = Math.max(this.getDepth((h as GroupedColumn<T>).children, level + 1), depth);
      }
    }
    return depth;
  }


  private initColumns<T>(columns: BaseColumn<T>[], defaultOptions: Required<DefaultColumnOptions>): BaseColumn<T>[] {


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
      column.type = column.type ?? 'string';

      //Set default formatter
      if (!column.formatter) {
        switch (column.type) {
          case 'int':
            column.formatter = this.getIntCellFormatter();
            break;
          case 'decimal':
            column.formatter = this.getDecimalCellFormatter();
            break;
          case 'datetime':
            column.formatter = this.getDateTimeCellFormatter();
            break;
          case 'date':
            column.formatter = this.getDateCellFormatter();
            break;
          case 'boolean':
            column.formatter = this.getBooleanCellFormatter();
            break;
          case 'map':
            const mapColumn = (<MapColumn<any>>column);
            if (!isSignal(mapColumn.valueMap)) {
              mapColumn.valueMap = signal(mapColumn.valueMap);
            }
            column.formatter = this.getMapFormatter(mapColumn.valueMap as Signal<any>);
            break;
          default:
            column.formatter = this.getDefaultCellFormatter();
        }
      }

      // Set default cellClass
      if (!column.cellClass && (column.type == 'int' || column.type == 'decimal')) {
        column.cellClass = (() => 'number-cell')
      }

      // Set default filterEditor
      // if (!column.filterEditor) {
      //   if (column.type == 'datetime') {
      //     column.filterEditor = this.getDateTimeFilterComponent();
      //   } else if (column.type == 'date') {
      //     column.filterEditor = this.getDateFilterComponent();
      //   } else if (column.type == 'map') {
      //     column.filterEditor = this.getMapFilterComponent();
      //   }
      // }

    } else if (baseColumn.type == 'tick') {


      (baseColumn as any).field = '__tick_' + index;
      baseColumn.sticky = baseColumn.sticky === undefined ? 'start' : null;


      const tickColumn = baseColumn as TickColumn<any>;
      tickColumn.cellRenderer = tickColumn.cellRenderer || { component: TickCellComponent };
      tickColumn.checkBoxHeader = tickColumn.checkBoxHeader !== false;
      tickColumn.headerRenderer = tickColumn.headerRenderer ? tickColumn.headerRenderer : tickColumn.checkBoxHeader ? {component: TickHeaderRenderer} : undefined;
      if (!tickColumn.cellClass) {
        tickColumn.cellClass = (_) => 'tick-cell'
      }
    } else if (baseColumn.type == 'computed') {
      (baseColumn as any).field = '__computed_' + index;
    }
    baseColumn.resizable = baseColumn.resizable === undefined ? defaultOptions.resizable : baseColumn.resizable;
    baseColumn.width = baseColumn.width || 0;
    baseColumn.visible = baseColumn.visible === undefined ? defaultOptions.visible : baseColumn.visible;
    baseColumn.headerRenderer = baseColumn.headerRenderer || defaultOptions.headerRenderer;

    if (!baseColumn.cellRenderer) {
      if (baseColumn.expansion) {
        baseColumn.cellRenderer = {
          component: ExpansionCellRenderer,
          parameter: baseColumn.expansion
        };
      } else {
        baseColumn.cellRenderer = defaultOptions.cellRenderer ?? this.getDefaultCellRenderer();
      }
    }

  }

  private toTitleCase(str: string) {
    str = str.replaceAll('_', ' ');
    return str.split(' ').map(txt => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase()).join(' ');
  }

  /**
   * Get default cell formatter. It does nothing beside changing null or undefined to empty string.
   * @returns 
   */
  getDefaultCellFormatter<T>(): CellFormatter<T> {
    return (val: any) => {
      return val ?? '';
    }
  }

  /**
   * Get default formatter for 'decimal'
   * @returns 
   */
  getDecimalCellFormatter<T>(): CellFormatter<T> {
    return (val) => {
      if (val === undefined || val == null || val == '') {
        return '';
      }
      return formatNumber(val, this.locale, '.2') ?? ''
    }
  }

  /**
   * Get default formatter for 'int'
   * @returns 
   */
  getIntCellFormatter<T>(): CellFormatter<T> {
    return (val: any) => val ?? '';
  }

  /**
   * Default formatter for 'boolean'
   * @returns 
   */
  getBooleanCellFormatter<T>(): CellFormatter<T> {
    return (val: any) => {
      if (val === true) {
        return 'True';
      } else if (val === false) {
        return 'False';
      } else {
        return val ?? '';
      }
    }
  }

  /**
   * Get default formatter for 'datetime'. Default is `d MMM yyyy H:mm:ss`
   * @returns 
   */
  getDateTimeCellFormatter<T>(): CellFormatter<T> {
    return (val) => {
      if (val) {
        return formatDate(val, 'd MMM yyyy H:mm:ss', this.locale) ?? ''
      }
      return '';
    }
  }

  /**
   * Get default formatter for 'date'. Default is `EEE, d MMM yyyy`
   * @returns 
   */
  getDateCellFormatter<T>(): CellFormatter<T> {
    return (val) => {
      if (val) {
        return formatDate(val, 'EEE, d MMM yyyy', this.locale) ?? ''
      }
      return '';
    }
  }

  /**
   * Default formatter for MapColumn ('map')
   * @param map 
   * @returns 
   */
  getMapFormatter<T>(map: Signal<{ [key: string]: any }>): CellFormatter<T> {
    return (val: any) => {
      return (map as any)()[val] ?? val;
    }
  }

  /**
   * Get default formatter for GroupBy functionality where the column type is 'date' or 'datetime'
   * and the modifier is 'month'
   * @returns 
   */
  getMonthCellFormatter<T>(): CellFormatter<T> {
    return (val: any) => {
      if (!val) {
        return '';
      }
      if ((val + '').length <= 7) {
        val = val + '-01';
      }
      return formatDate(val, 'MMM yyyy', this.locale) ?? '';
    }
  }

  /**
   * Get default formatter for GroupBy functionality where the column type is 'date' or 'datetime'
   * and the modifier is 'year'
   * @returns 
   */
  getYearCellFormatter<T>(): CellFormatter<T> {
    return (val: any) => {
      if (!val) {
        return '';
      }
      if ((val + '').length <= 4) {
        val = val + '-01-01';
      }
      return formatDate(val, 'yyyy', this.locale) ?? '';
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
    return DEFAULT_LABEL_TRANSLATION;
  }

  /**
   * Unspecified properties in `BaseColumn` when calling `PanemuTableService.buildColumns` use values returned by this method.
   * @returns 
   */
  getColumnOptions(): Required<DefaultColumnOptions> {
    return {
      visible: true,
      filterable: true,
      groupable: true,
      resizable: true,
      sortable: true,
      cellRenderer: this.getDefaultCellRenderer(),
      headerRenderer: this.getDefaultHeaderRenderer()
    }
  }

  /**
   * Get default table options.
   * @returns 
   */
  getTableOptions<T>(): Required<TableOptions<T>> {
    let defaultOptions: Required<TableOptions<T>> = {
      rowOptions: {
        rowSelection: true
      },
      autoHeight: false,
      virtualScroll: false,
      virtualScrollRowHeight: 32,
      footer: null,
      calculateColumnWidthDelay: 500,
      saveState: null,
      errorHandler: this.handleError.bind(this)
    };
    return defaultOptions;
  }

  /**
   * Get default value for pagination maxRows. Override this method to apply default maxRows app-wide.
   * @returns default 100
   */
  getPaginationMaxRows() {
    return 100;
  }

  /**
   * Limit for pagination maxRows to prevent user entering too big range in pagination input range
   * for example 1-1000. In that case the maxRows is 1000 and it is bigger than the value returned
   * by this method (500 by default). The pagination will fallback to 1-500.
   * 
   * @returns biggest possible number for pagination maxRows. Default is 500.
   */
  getPaginationMaxRowsLimit() {
    return 500;
  }

  // /**
  //  * Default `ColumnType.Date` filter component used by `PanemuQueryComponent`.
  //  * @returns 
  //  */
  // getDateFilterComponent(): Type<FilterEditor> {
  //   return DateFilterComponent
  // }

  // /**
  //  * Default `ColumnType.DateTime` filter component used by `PanemuQueryComponent`.
  //  * @returns 
  //  */
  // getDateTimeFilterComponent(): Type<FilterEditor> {
  //   return DateTimeFilterComponent
  // }

  // /**
  //  * Default `ColumnType.Map` filter component used by `PanemuQueryComponent`.
  //  * @returns 
  //  */
  // getMapFilterComponent(): Type<FilterEditor> {
  //   return MapFilterComponent
  // }

  // /**
  //  * Default filter component used by `PanemuQueryComponent`.
  //  * @returns 
  //  */
  // getDefaultFilterComponent(): Type<FilterEditor> {
  //   return StringFilterComponent;
  // }

  /**
   * Function to handle error globally. Override this method to have your own error handler.
   * @param err 
   * @returns 
   */
  handleError(err: any) {
    console.error('There is an error when loading table. Override this error handler in PanemuTableService.handleError', err);
    alert(err.message || 'There is an error when loading table. Override this error handler in PanemuTableService.handleError')
  }

  /**
   * By default `TableState` is saved to local storage. Override this method if you want
   * to save it in a database server. If you override it, ensure to also override `PanemuTableService.getTableState`
   * and `PanemuTableService.deleteTableState`.
   * @param stateKey 
   * @param state 
   */
  saveTableState(stateKey: string, state: TableState) {
    localStorage.setItem(stateKey, JSON.stringify(state));
  }

  /**
   * Get table state. The state is by default stored in local storage. This method returns an Observable
   * so it can be overriden with http call in case developer save the state in server side.
   * If you override it, ensure to also override `PanemuTableService.saveTableState` and `PanemuTableService.deleteTableState`.
   * @param stateKey 
   * @returns 
   */
  getTableState(stateKey: string): Observable<TableState | null> {
    const stateString = localStorage.getItem(stateKey);
    if (stateString) {

      try {
        const state = JSON.parse(stateString) as TableState;
        return of(state)
      } catch (e) {
        console.error(`Failed to parse table state with key ${stateKey}`)
        console.error(e);
      }
    }
    return of(null);
  }

  /**
   * Delete [table state](/usages/persist-states).
   * If you override it, ensure to also override `PanemuTableService.saveTableState` and `PanemuTableService.getTableState`.
   * @param stateKey
   */
  deleteTableState(stateKey: string) {
    localStorage.removeItem(stateKey);
    return of(null);
  }

  /**
   * Override this method to specify default cell renderer globally.
   * @returns cell renderer
   */
  getDefaultCellRenderer() {
    return DefaultCellRenderer.create();
  }

  /**
   * Override this method to specify default header renderer globally.
   * @returns HeaderRenderer
   */
  getDefaultHeaderRenderer(): HeaderRenderer {
    return DefaultHeaderRenderer.create()
  }
}
