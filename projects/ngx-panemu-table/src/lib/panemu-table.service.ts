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
import { Observable, of } from 'rxjs';
import { DEFAULT_LABEL_TRANSLATION } from './option/default-label-translation';
import { DateTimeFilterComponent } from './query/editor/date-time-filter.component';
import { HeaderRenderer } from '../public-api';

const GROUP_KEY_PREFIX = 'group_';

@Injectable({
  providedIn: 'root'
})
export class PanemuTableService {

  constructor(@Inject(LOCALE_ID) protected locale: string) {}

  /**
   * Build columns for the table. This method handle column initialization. The `options` argument is by default
   * taken from `PanemuTableService.getColumnOptions`
   * 
   * @param columns 
   * @param options any specified value will override `PanemuTableService.getColumnOptions`.
   * @returns 
   */
  buildColumns<T>(columns: (NonGroupColumn<T> | GroupedColumn)[], options?: DefaultColumnOptions): ColumnDefinition<T> {
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
    groupIndex: WritableSignal<number>,
    defaultOptions?: Required<DefaultColumnOptions>
  ) {

    if (!wholeResult[level]) {
      wholeResult[level] = { cells: [] };
    }
    let colSpan = 0;

    for (const h of headers) {
      if (h.type == ColumnType.GROUP) {
        const clmGroup = h as GroupedColumn;
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

  private getDepth<T>(headers: (GroupedColumn | NonGroupColumn<T>)[], level: number) {
    let depth = level + 1;
    for (const h of headers) {
      if (h.type == ColumnType.GROUP) {
        depth = Math.max(this.getDepth((h as GroupedColumn).children, level + 1), depth);
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
      column.type = column.type ?? ColumnType.STRING;

      //Set default formatter
      if (!column.formatter) {
        switch (column.type) {
          case ColumnType.INT:
            column.formatter = this.getIntCellFormatter();
            break;
          case ColumnType.DECIMAL:
            column.formatter = this.getDecimalCellFormatter();
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
            break;
          default:
            column.formatter = this.getDefaultCellFormatter();
        }
      }

      // Set default cellClass
      if (!column.cellClass && (column.type == ColumnType.INT || column.type == ColumnType.DECIMAL)) {
        column.cellClass = (() => 'number-cell')
      }

      // Set default filterEditor
      if (!column.filterEditor) {
        if (column.type == ColumnType.DATETIME) {
          column.filterEditor = this.getDateTimeFilterComponent();
        } else if (column.type == ColumnType.DATE) {
          column.filterEditor = this.getDateFilterComponent();
        } else if (column.type == ColumnType.MAP) {
          column.filterEditor = this.getMapFilterComponent();
        }
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
      if (val === undefined || val == null || val == '') {
        return '';
      }
      return formatNumber(val, this.locale, '.2') ?? ''
    }
  }

  /**
   * Get default formatter for ColumnType.INT
   * @returns 
   */
  getIntCellFormatter(): CellFormatter {
    return (val: any) => val ?? '';
  }

  /**
   * Get default formatter for ColumnType.DATETIME. Default is `d MMM yyyy H:mm:ss`
   * @returns 
   */
  getDateTimeCellFormatter(): CellFormatter {
    return (val) => {
      if (val) {
        return formatDate(val, 'd MMM yyyy H:mm:ss', this.locale) ?? ''
      }
      return '';
    }
  }

  /**
   * Get default formatter for ColumnType.DATE. Default is `EEE, d MMM yyyy`
   * @returns 
   */
  getDateCellFormatter(): CellFormatter {
    return (val) => {
      if (val) {
        return formatDate(val, 'EEE, d MMM yyyy', this.locale) ?? ''
      }
      return '';
    }
  }

  /**
   * Default formatter for MapColumn (ColumnType.MAP)
   * @param map 
   * @returns 
   */
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
   * Get default formatter for GroupBy functionality where the column type is ColumnType.DATE or ColumnType.DATETIME
   * and the modifier is 'year'
   * @returns 
   */
  getYearCellFormatter(): CellFormatter {
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
    return DateTimeFilterComponent
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
    console.error(err);
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
   * Delete table state.
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
