import { Signal, signal, TemplateRef, Type, WritableSignal } from "@angular/core";
import { BehaviorSubject, catchError, finalize, Observable, of, skip, Subject, switchMap } from "rxjs";
import { BaseColumn, ColumnDefinition, ColumnType } from "./column/column";
import { PanemuTableDataSource } from "./datasource/panemu-table-datasource";
import { TableOptions } from "./option/options";
import { PanemuPaginationController, RefreshPagination } from "./pagination/panemu-pagination-controller";
import { ExpansionRow, ExpansionRowRenderer } from "./row/expansion-row";
import { RowGroup, RowGroupData, RowGroupFooter } from "./row/row-group";
import { TableData } from "./table-data";
import { GroupBy, TableCriteria, TableQuery } from "./table-query";
import { formatDateToIso, isDataRow, mergeDeep, toDate } from "./util";

/**
 * Function to retrieve data based on pagination, sorting, filtering and grouping setting.
 * It is used for server side pagination, filtering, sorting and grouping. In this scenario,
 * it replace `PanemuTableDataSource`.
 * 
 * `startIndex`: zero-based row index to retrive.
 * 
 * `maxRows`: Maximum rows to fetch per page. To avoid user entering very big number that can bring server
 * or the browser down, override `PanemuTableService.getPaginationMaxRowsLimit`.
 */
export type RetrieveDataFunction<T> = (startIndex: number, maxRows: number, tableQuery: TableQuery) => Observable<TableData<T>>;

type DisplayDataFunction<T> = (data: T[] | RowGroupData[], parent?: RowGroup, groupField?: GroupBy) => void;

type ExpandCell<T> = (row: T, ExpansionRowComponent: Signal<TemplateRef<any> | undefined> | Type<ExpansionRowRenderer<T>>, column: BaseColumn<T>, expanded?: WritableSignal<boolean>) => void

/**
 * This class provide a way to interact with `PanemuTableComponent`. It requires columns information and a way
 * to get data.
 */
export class PanemuTableController<T> implements PanemuPaginationController {

  static DEFAULT_ERROR_HANDLER = (err: any) => {
    console.error(err)
    alert('There is an error when loading table. Override this error handler by setting PanemuTableController.DEFAULT_ERROR_HANDLER at the start of the application ')
  }

  
  private static DEFAULT_MAX_ROWS: number;

  private static MAX_ROWS_LIMIT = 500;
  
  /**
   * The value of this signal is set by table component. The table knows how to agregate the
   * row data, groups data etc.
   * @internal
   */
  private data = signal<(T | RowGroup | RowGroupFooter | ExpansionRow<T>)[]>([]);

  // private __regularData = computed(() => {
  //   if (this.data?.()) {
  //     const result = this.data().filter(item => isDataRow(item)) as T[]
  //     return result;
  //   }
  //   return []
  // })

  private selectedRow = signal<T | null>(null)
  groupByColumns: GroupBy[] = [];
  criteria: TableCriteria[] = [];
  private _loading = new BehaviorSubject<boolean>(false);
  // __tableRelayout?: Function;

  /**
   * @internal
   */
  private tableDisplayData?: DisplayDataFunction<T>;

  private expandCell?: ExpandCell<T>

  private refreshPagination?: RefreshPagination;
  private reloadCue = new BehaviorSubject(0);
  private afterReload$ = new BehaviorSubject<TableData<T> | null>(null);
  private _startIndex = 0;
  private lastReloadTotalRows = 0;
  private _maxRows = Math.min(PanemuTableController.DEFAULT_MAX_ROWS, PanemuTableController.MAX_ROWS_LIMIT);
  private static DEFAULT_TABLE_OPTIONS: TableOptions<any>;
  tableOptions: TableOptions<T> = JSON.parse(JSON.stringify(PanemuTableController.DEFAULT_TABLE_OPTIONS));
  sortedColumn: { [key: string]: 'asc' | 'desc' } = {};

  private hasPagination = false;
  /**
   * Force refresh the table.
   */
  refreshTable!: Function;
  // columns: BaseColumn<T>[];

  private constructor(public columnDefinition: ColumnDefinition<T>, 
    private retrieveDataFunction: RetrieveDataFunction<T>, 
    tableOptions?: Partial<TableOptions<T>>) {
    
    mergeDeep(this.tableOptions, tableOptions);
    this.tableOptions.rowOptions.rowSelection = this.tableOptions.rowOptions.rowSelection ?? true;  
    this.tableOptions.autoHeight = this.tableOptions.virtualScroll ? false : this.tableOptions.autoHeight;
    this.initReloadCueListener();
  }

  /**
   * Create controller with pagination, sorting, filtering and grouping handled by supplied `PanemuTableDataSource`.
   * @param columns 
   * @param datasource 
   * @returns 
   */
  static create<T>(columns: ColumnDefinition<T>,
    datasource: PanemuTableDataSource<T>,
    tableOptions?: Partial<TableOptions<T>>) {

    return new PanemuTableController(columns, (start, max, tq) => {
      return datasource.getData(start, max, tq);
    }, tableOptions)
  }

  /**
   * Create controller with pagination, sorting, filtering and grouping handled by custom datasource. It provide
   * a way to specify custom logic for pagination, sorting, filtering and grouping in server side.
   * @param columns 
   * @param retrieveDataFunction 
   * @returns 
   */
  static createWithCustomDataSource<T>(columns: ColumnDefinition<T>, retrieveDataFunction: RetrieveDataFunction<T>, tableOptions?: Partial<TableOptions<T>>) {
    return new PanemuTableController(columns, retrieveDataFunction, tableOptions)
  }

  private createTableQuery() {
    let tq = new TableQuery();
    if (this.groupByColumns?.length) {
      tq.groupBy = this.groupByColumns[0];
    }
    for (const key in this.sortedColumn) {
      tq.sortingInfos.push({ field: key, direction: this.sortedColumn[key] })
    }
    tq.tableCriteria = [...this.criteria];
    return tq;
  }

  // getColumn(field: keyof T) {
  //   return (this.columns as PropertyColumn<T>[]).find(item => item.field == field)
  // }
  private initReloadCueListener() {
    /**
     * Wrap reload routine in a switchMap so only the last request matters
     */
    this.reloadCue.pipe(
      skip(1),
      switchMap(_ => {
        this._loading.next(true);
        let tq = this.createTableQuery();
        let start = this._startIndex;
        let rowsToLoad = this._maxRows;
        if (!this.refreshPagination && !this.hasPagination) {
          start = 0;
          rowsToLoad = 0;
        }
        
        return this.retrieveDataFunction(start, rowsToLoad, tq).pipe(
          finalize(() => this._loading.next(false)),
          catchError(err => {
            PanemuTableController.DEFAULT_ERROR_HANDLER(err);
            return of(null)
          })
        );
      })
    ).subscribe({
      next: result => {
        if (result) {
          this.tableDisplayData?.(result.rows, undefined, this.groupByColumns?.[0]);
          this.lastReloadTotalRows = result.totalRows;
          setTimeout(() => {
            this.refreshPagination?.(this._startIndex, this._maxRows, result.totalRows);
          });
        } else {
          this.lastReloadTotalRows = 0;
        }
        this.afterReload$.next(result);
      },
      error: e => console.error(e)
    })
  }

  /**
   * Connect pagination component with the controller. It tells the controller
   * that pagination should be used. If there is no pagination component calling
   * this method, the controller will set its `maxRows` to 0 which means the datasource
   * should return all data. 
   * 
   * The controller will also tell the pagination about pagination information after each reload.
   * 
   * @param refreshAction callback function called by the controller so that the pagination
   * component can update itself. This callback is called after reloading data.
   */
  initPaginationComponent(refreshAction: RefreshPagination) {
    this.refreshPagination = refreshAction;

    /**
     * If the controller has loaded data before the pagination is connected,
     * then tell pagination component to display the pagination info. It happens
     * when virtual scroll active. If the table is scrolled down/up, the rowgroup
     * and pagination component is recreated.
     */
    if (this.data().length) {
      this.refreshPagination(this.startIndex, 
        Math.min(this.lastReloadTotalRows, this.maxRows), 
        this.lastReloadTotalRows)
    }
  }

  /**
   * This observable fire just before loading a data. This is only for table controller.
   * It will not fire for `RowGroup` expand action because RowGroup has its own
   * controller instance.
   * @returns 
   */
  get beforeReloadEvent() {
    return this.reloadCue.asObservable();
  }

  /**
   * Observable to listen to after reload event. This is only for table controller.
   * It will not fire for `RowGroup` expand action because RowGroup has its own
   * controller instance.
   */
  get afterReloadEvent() {
    return this.afterReload$.asObservable()
  }

  // relayout() {
  //   this.__tableRelayout?.();
  // }

  /**
   * Get data being displayed in table. It only returns regular row data. It excludes `RowGroup` and `ExpansionRow`. 
   * It doesn't returns all data in datasource.
   * 
   * To get all date from table including of type `RowGroup` and `ExpansionRow` see `getAllData` method.
   * 
   * @returns 
   */
  getData() {
    if (this.data?.()) {
      const result = this.data().filter(item => isDataRow(item)) as T[]
      return result;
    }
    return [];
  }

  /**
   * Get data being displayed in table including `ExpansionRow` and `RowGroup`. If a `RowGroup` is collapsed, its children
   * are not included because they aren't visible in the table.
   * 
   * @returns 
   */
  getAllData() {
    return this.data?.() ? [...this.data()] : []
  }

  /**
   * Get data being displayed in table as signal. See also `getAllData` method.
   * @returns 
   */
  getAllDataAsSignal() {
    return this.data
  }

  /**
   * Get loading observable. Loading status is true when data is being retrieved from datasource.
   */
  get loading() {
    return this._loading as Observable<boolean>;
  }

  /**
   * Set start index. Only usable if there is `PanemuPaginationComponent` using this controller.
   */
  set startIndex(val: number) { this._startIndex = val }

  /**
   * Get start index from connected `PanemuPaginationComponent`. First index is 0.
   */
  get startIndex() { return this._startIndex }

  /**
   * Set max rows to display in table. Only usable if there is `PanemuPaginationComponent` using this controller.
   * Otherwise all data from datasource is displayed at once.<br><br>
   * 
   * To change default max rows for all tables across application, create a service extending PanemuTableService 
   * and override `PanemuTableService.getPaginationMaxRows`.
   * 
   * The value is limited by `PanemuTableService.getPaginationMaxRowsLimit`.
   */
  set maxRows(val: number) { this._maxRows = Math.min(val, PanemuTableController.MAX_ROWS_LIMIT) }

  /**
   * Get max rows from connected `PanemuPaginationComponent`.
   * 
   * To change default max rows for all tables across application, create a service extending PanemuTableService 
   * and override `PanemuTableService.getPaginationMaxRows`
   */
  get maxRows() { return this._maxRows }

  /**
   * This is an internal method used by grouping functionality and group-level pagination.
   * You shouldn't need to call this method unless you are creating custom pagination component.
   * @param group
   * @internal 
   */
  reloadGroup(group: RowGroup) {
    if (!group.controller) {
      group.controller = this.createGroupController(group);
    }
    group.controller.hasPagination = true;
    group.controller.reloadCurrentPage();
  }

  private createGroupController(group: RowGroup) {
    let groupController = new PanemuTableController({header: [], body: []}, this.retrieveDataFunction);
    let slicedGroupByColumn = group.parent ? group.parent.controller!.groupByColumns.slice(1) : this.groupByColumns.slice(1);
    groupController.groupByColumns = slicedGroupByColumn;
    groupController.createTableQuery = () => {
      let tq = this.createTableQuery();
      if (slicedGroupByColumn?.length) {
        tq.groupBy = slicedGroupByColumn[0];
      } else {
        delete tq.groupBy;
      }
      tq.tableCriteria.push(...this.buildCriteriaRecursively(group, []));
      return tq;
    }

    /**
     * When the group controller get the data, dispatch it to
     * parent controller
     */
    groupController.tableDisplayData = (data: T[] | RowGroupData[], parent?: RowGroup, groupField?: GroupBy) => {
      groupController.data.set(data as any);
      this.tableDisplayData!(data, group, groupField);
    };
    
    return groupController;
  }

  private buildCriteriaRecursively(group: RowGroup, tableCriteria: TableCriteria[]) {
    if (group.parent) {
      this.buildCriteriaRecursively(group.parent, tableCriteria);
    }
    let val = group.column.type != null && group.column.type != undefined && group.column.type != ColumnType.STRING ? group.data.value : `"${group.data.value}"`;
    if (group.modifier == 'year') {
      let nextYear = +(group.data.value) + 1;
      val = `${group.data.value}-01-01.,${nextYear}-01-01`;
    } else if (group.modifier == 'month') {
      let endMonth = toDate(group.data.value + '-01');
      endMonth.setMonth(endMonth.getMonth() + 1);
      val = group.data.value + '-01' + '.,' + formatDateToIso(endMonth);

    }
    tableCriteria.push({ field: group.field, value: val });
    return tableCriteria;
  }

  /**
   * Reload data but reset the pagination start index to 0 before hand.
   */
  reloadData() {
    this.startIndex = 0;
    this.reloadCurrentPage();
  }

  /**
   * Reload data without resetting pagination start index.
   */
  reloadCurrentPage() {
    if (this.tableDisplayData) {
      this.reloadCue.next(this.reloadCue.getValue() + 1)
    } else {
      setTimeout(() => {
        this.reloadCue.next(this.reloadCue.getValue() + 1)
      });
    }
  }

  /**
   * Get selected row. A row is selected if user click it. RowGroup cannot be selected.
   * @returns 
   */
  getSelectedRow() {
    return this.selectedRow()
  }

  /**
   * Get selected row as signal. A row is selected if user click it. RowGroup cannot be selected.
   * @returns 
   */
  getSelectedRowSignal() {
    return this.selectedRow.asReadonly()
  }

  /**
   * Select a row in the table by row index or row object. RowGroup can't be selected.
   * @param rowOrIndex row index or row object
   * @returns true if the row index or row object is successfully selected. Return false if the object in selected index is a RowGroup or the row object is not in table data
   */
  selectRow(rowOrIndex: T | number) {
    if (!this.data || !this.tableOptions.rowOptions.rowSelection) return false;

    if (typeof rowOrIndex == 'number') {
      const row = this.data!()[rowOrIndex as number];
      if (row && isDataRow(row)) {
        this.selectedRow.set(row as T);
        return true;
      }
    } else if (this.data().includes(rowOrIndex)) {
      this.selectedRow.set(rowOrIndex);
      return true;
    }
    return false;
  }

  /**
   * Select the first data row (not RowGroup nor ExpansionRow). If the table is groupped and none of the group is expanded, this function
   * will always return false because none will be selected.
   * @returns true if succesful in which there is a non RowGroup to select.
   */
  selectFirst() {
    if (this.data) {
      for (const aRow of this.data()) {
        if (isDataRow(aRow)) {
          this.selectedRow.set(aRow as T);
          return true;
        }
      }
    }
    return false;
  }

  /**
   * Clear row selection
   */
  clearSelection() {
    this.selectedRow.set(null)
  }

  expand(row: T, column: BaseColumn<T>, expanded?: WritableSignal<boolean>) {
    this.expandCell?.(row, column.expansion!.component, column, expanded)
  }

  private escapeCsvText(text: string) {
    if (typeof text == 'string') {
      if (text.replace(/ /g, '').match(/[\s,"]/)) {
        return '"' + text.replace(/"/g, '""') + '"';
      }
      return text;
    } else return text + '';
  }

  /**
   * Get data as comma separated string. By default it includes the header and `RowGroup`s.
   * 
   * @param options provide a way to exclude header or `RowGroup` rows.
   * @returns csv string
   */
  getCsvData(options?: {includeHeader?: boolean, includeRowGroup?: boolean}) {
    const csvOption = {includeHeader: true, includeRowGroup: true};
    if (options) {
      Object.assign(csvOption, options);
    }
    const csv: string[] = [];
    
    const visibleCols = this.columnDefinition.body.filter(item => item.visible && item.type != ColumnType.TICK);

    if (csvOption.includeHeader) {
      csv.push(visibleCols.map(item => this.escapeCsvText(item.label || '')).join(','));
    }

    for (const row of this.data()) {
      
      const csvRow: string[] = [];
      
      if (row instanceof RowGroup && csvOption.includeRowGroup) {
        csvRow.push(this.escapeCsvText(row.formatter(row.data.value) + ` (${row.data.count || 0})`));
        for (let index = 1; index < visibleCols.length; index++) {
          csvRow.push('');
        }
        csv.push(csvRow.join(','));
      } else if (isDataRow(row)) {
        const dataRow = row as T;
        for (const col of visibleCols) {
          if (col.formatter) {
            csvRow.push(this.escapeCsvText(col.formatter(dataRow[col.field])))
          } else {
            csvRow.push(this.escapeCsvText(dataRow[col.field] + ''))
          }
        }
        csv.push(csvRow.join(','));
      }
    }

    return csv.join('\n');
  }
}