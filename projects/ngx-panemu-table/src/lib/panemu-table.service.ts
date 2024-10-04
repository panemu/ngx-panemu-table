import { formatDate, formatNumber } from '@angular/common';
import { Inject, Injectable, isSignal, LOCALE_ID, signal, Signal, Type, WritableSignal } from '@angular/core';
import { CellFormatter } from './cell/cell';
import { DefaultCellRenderer } from "./cell/default-cell-renderer";
import { DefaultHeaderRenderer } from './cell/default-header-renderer';
import { ExpansionCellRenderer } from './cell/expansion-cell-renderer';
import { BaseColumn, ColumnDefinition, ColumnType, GroupedColumn, HeaderRow, MapColumn, NonGroupColumn, PropertyColumn } from './column/column';
import { DefaultColumnOptions } from './column/default-column-options';
import { LabelTranslation } from './option/label-translation';
import { TableOptions } from './option/options';
import { TableState } from './state/table-states';
import { DateFilterComponent } from './query/editor/date-filter.component';
import { FilterEditor } from './query/editor/filter-editor';
import { MapFilterComponent } from './query/editor/map-filter.component';
import { StringFilterComponent } from './query/editor/string-filter.component';
import { generateStructureKey, mergeDeep } from './util';
import { EMPTY, of } from 'rxjs';
const GROUP_KEY_PREFIX = 'group_';

@Injectable({
  providedIn: 'root'
})
export class PanemuTableService {

  DEFAULT_LABEL_TRANSLATION: LabelTranslation = {
    search: 'Type here or double click to search',
    loading: 'Loading...',
    day: 'Day',
    month: 'Month',
    year: 'Year',
    groupBy: 'Group By',
    noData: 'No data to display',
    searcForValueInColumn: 'Search for "{par0}" in:',
    selectColumnToSearchOn: 'Select a column to search on',
    columns: 'Columns',
    visibility_position_stickiness: 'Visibility, Position and Stickiness',
    stickyStart: 'Sticky Start',
    stickyEnd: 'Sticky End',
    reset: 'Reset'
  };

  constructor(@Inject(LOCALE_ID) protected locale: string) {

  }

  /**
   * Build columns for the table. This method handle column initialization. The `options` argument is by default
   * taken from `PanemuTableService.getColumnOptions`
   * 
   * @param columns 
   * @param options any specified value will override `PanemuTableService.getColumnOptions`.
   * @returns 
   */
  buildColumns<T>(columns: (NonGroupColumn<T> | GroupedColumn)[], options?: DefaultColumnOptions): ColumnDefinition<T> {
    let bodyColumns = this.buildBody(columns);
    this.initColumns(bodyColumns, options);
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
    let bodyColumns = this.buildBody(columnDef.mutatedStructure);
    let headerRows: HeaderRow[] = [];
    this.buildHeaders(headerRows, columnDef.mutatedStructure, 0, this.getDepth(columnDef.mutatedStructure, 0), signal(0));
    columnDef.header = headerRows;
    columnDef.body = bodyColumns as PropertyColumn<any>[];
  }

  private buildBody<T>(headers: (GroupedColumn | NonGroupColumn<T>)[]) {
    let columns: BaseColumn<T>[] = [];
    for (const h of headers) {
      if (h.type !== ColumnType.GROUP) {
        columns.push(h)
      } else {
        columns = columns.concat(this.buildBody((h as GroupedColumn).children))
      }
    }

    return columns;
  }

  private buildHeaders<T>(wholeResult: HeaderRow[], headers: (GroupedColumn | NonGroupColumn<T>)[],
    level: number,
    totalDepth: number,
    groupIndex: WritableSignal<number>
  ) {

    if (!wholeResult[level]) {
      wholeResult[level] = { cells: [] };
    }
    let colSpan = 0;

    for (const h of headers) {
      if (h.type == ColumnType.GROUP) {
        const clmGroup = h as GroupedColumn;
        let groupDepth = this.getDepth(clmGroup.children, 0);
        let groupRowSpan = totalDepth - groupDepth - level;
        let currentGroupIndex = groupIndex();
        groupIndex.update(i => i + 1);
        let childrenColSpan = this.buildHeaders(wholeResult, clmGroup.children, level + groupRowSpan, totalDepth, groupIndex);

        if (childrenColSpan) {
          //{ colSpan: childrenColSpan, label: h.label!, rowSpan: groupRowSpan, headerRenderer: DefaultHeaderRenderer.create(), isGroup: true }
          let groupHeader: BaseColumn<any> = {
            __colSpan: childrenColSpan,
            label: clmGroup.label!,
            __rowSpan: groupRowSpan,
            headerRenderer: DefaultHeaderRenderer.create(),
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

  private getDepth<T>(headers: (GroupedColumn | NonGroupColumn<T>)[], level: number) {
    let depth = level + 1;
    for (const h of headers) {
      if (h.type == ColumnType.GROUP) {
        depth = Math.max(this.getDepth((h as GroupedColumn).children, level + 1), depth);
      }
    }
    return depth;
  }


  private initColumns<T>(columns: BaseColumn<T>[], options?: DefaultColumnOptions): BaseColumn<T>[] {
    const defaultOptions = this.getColumnOptions();
    if (options) {
      mergeDeep(defaultOptions, options);
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
            column.filterEditor = column.filterEditor || this.getDateTimeFilterComponent();
            break;
          case ColumnType.DATE:
            column.formatter = this.getDateCellFormatter();
            column.filterEditor = column.filterEditor || this.getDateFilterComponent();
            break;
          case ColumnType.MAP:
            const mapColumn = (<MapColumn<any>>column);
            if (!isSignal(mapColumn.valueMap)) {
              mapColumn.valueMap = signal(mapColumn.valueMap);
            }
            column.formatter = this.getMapFormatter(mapColumn.valueMap as Signal<any>);
            // if (!column.cellRenderer) {
            //   column.cellRenderer = { component: MapCellRenderer }
            // }
            column.filterEditor = column.filterEditor || this.getMapFilterComponent();
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

    if (!baseColumn.cellRenderer) {
      if (baseColumn.expansion) {
        baseColumn.cellRenderer = {
          component: ExpansionCellRenderer,
          parameter: baseColumn.expansion
        };
      } else {
        baseColumn.cellRenderer = DefaultCellRenderer.create();
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
  getColumnOptions(): Required<DefaultColumnOptions> {
    return {
      visible: true,
      filterable: true,
      groupable: true,
      resizable: true,
      sortable: true,
    }
  }

  /**
   * Get default table options.
   * @returns 
   */
  getTableOptions<T>(): TableOptions<T> {
    let defaultOptions: Required<TableOptions<T>> = {
      rowOptions: {
        rowSelection: true
      },
      autoHeight: false,
      virtualScroll: false,
      virtualScrollRowHeight: 32,
      footer: null,
      calculateColumWidthDelay: 500,
      stateKey: ''
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

  /**
   * Default `ColumnType.Date` filter component used by `PanemuQueryComponent`.
   * @returns 
   */
  getDateFilterComponent(): Type<FilterEditor> {
    return DateFilterComponent
  }

  /**
   * Default `ColumnType.DateTime` filter component used by `PanemuQueryComponent`.
   * @returns 
   */
  getDateTimeFilterComponent(): Type<FilterEditor> {
    return DateFilterComponent
  }

  /**
   * Default `ColumnType.Map` filter component used by `PanemuQueryComponent`.
   * @returns 
   */
  getMapFilterComponent(): Type<FilterEditor> {
    return MapFilterComponent
  }

  /**
   * Default filter component used by `PanemuQueryComponent`.
   * @returns 
   */
  getDefaultFilterComponent(): Type<FilterEditor> {
    return StringFilterComponent;
  }

  /**
   * Function to handle error. Override this method to have your own error handler.
   * @param err 
   * @returns 
   */
  handleError(err: any) {
    return (err: any) => {
      console.error(err)
      alert('There is an error when loading table. Override this error handler by setting PanemuTableController.DEFAULT_ERROR_HANDLER at the start of the application ')
    }
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
  getTableState(stateKey: string) {
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
    return EMPTY;
  }

  /**
   * Delete table state.
   * If you override it, ensure to also override `PanemuTableService.saveTableState` and `PanemuTableService.getTableState`.
   * @param stateKey 
   */
  deleteTableState(stateKey: string) {
    localStorage.removeItem(stateKey);
  }
}
