import { Signal, signal } from "@angular/core";
import { BehaviorSubject, catchError, finalize, Observable, of, Subject, switchMap } from "rxjs";
import { BaseColumn, ColumnType } from "./column/column";
import { PanemuTableDataSource } from "./datasource/panemu-table-datasource";
import { PanemuPaginationController, RefreshPagination } from "./pagination/panemu-pagination-controller";
import { RowGroup } from "./row/row-group";
import { TableData } from "./table-data";
import { GroupBy, TableCriteria, TableQuery } from "./table-query";
import { RowOptions } from "./row/row-options";

/**
 * Function to retrieve data based on pagination, sorting, filtering and grouping setting.
 * It is used for server side pagination, filtering, sorting and grouping. In this scenario,
 * it replace `PanemuTableDataSource`.
 * 
 * `startIndex`: zero-based row index to retrive.
 * 
 * `maxRows`: Maximum rows to fetch per page. To avoid user entering very big number that can bring server
 * or the browser down, specify the value of `MAX_ROWS_LIMIT`. By default it is 500.
 */
export type RetrieveDataFunction<T> = (startIndex: number, maxRows: number, tableQuery: TableQuery) => Observable<TableData<T>>;

type DisplayDataFunction<T> = (data: T[] | RowGroup[], parent?: RowGroup, groupField?: GroupBy) => void;

/**
 * This class provide a way to interact with `PanemuTableComponent`. It requires columns information and a way
 * to get data.
 */
export class PanemuTableController<T> implements PanemuPaginationController {

  static DEFAULT_ERROR_HANDLER = (err: any) => {
    console.error(err)
    alert('There is an error when loading table. Override this error handler by setting PanemuTableController.DEFAULT_ERROR_HANDLER at the start of the application ')
  }

  /**
   * Set default value for pagination maxRows. Set this value when the application start to apply it app-wide.
   */
  static DEFAULT_MAX_ROWS = 100;

  /**
   * Set biggest possible number for `DEFAULT_MAX_ROWS`. It is to avoid user entering very big number.
   */
  static MAX_ROWS_LIMIT = 500;

  /**
   * @internal
   */
  __data?: Signal<(T | RowGroup)[]>;
  private __selectedRow = signal<T | null>(null)
  groupByColumns: GroupBy[] = [];
  criteria: TableCriteria[] = [];
  private _loading = new BehaviorSubject<boolean>(false);
  // __tableRelayout?: Function;

  /**
   * @internal
   */
  __tableDisplayData?: DisplayDataFunction<T>;

  /**
   * @internal
   */
  __refreshPagination?: RefreshPagination;
  private reloadCue = new Subject();
  private _startIndex = 0;
  private _maxRows = Math.min(PanemuTableController.DEFAULT_MAX_ROWS, PanemuTableController.MAX_ROWS_LIMIT);

  sortedColumn: { [key: string]: 'asc' | 'desc' } = {};

  /**
   * Force refresh the table.
   */
  refreshTable!: Function;

  private constructor(public columns: BaseColumn<T>[], private retrieveDataFunction: RetrieveDataFunction<T>, public __rowOptions?: RowOptions<T>) {
    if (!__rowOptions) {
      this.__rowOptions = {}
    }

    this.__rowOptions!.rowSelection = this.__rowOptions!.rowSelection ?? true;
    this.initReloadCueListener();
  }

  /**
   * Create controller with pagination, sorting, filtering and grouping handled by supplied `PanemuTableDataSource`.
   * @param columns 
   * @param datasource 
   * @returns 
   */
  static create<T>(columns: BaseColumn<T>[],
    datasource: PanemuTableDataSource<T>,
    rowOptions?: RowOptions<T>) {

    return new PanemuTableController(columns, (start, max, tq) => {
      return datasource.getData(start, max, tq);
    }, rowOptions)
  }

  /**
   * Create controller with pagination, sorting, filtering and grouping handled by custom datasource. It provide
   * a way to specify custom logic for pagination, sorting, filtering and grouping in server side.
   * @param columns 
   * @param retrieveDataFunction 
   * @returns 
   */
  static createWithCustomDataSource<T>(columns: BaseColumn<T>[], retrieveDataFunction: RetrieveDataFunction<T>, rowOptions?: RowOptions<T>) {
    return new PanemuTableController(columns, retrieveDataFunction, rowOptions)
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
      switchMap(_ => {
        this._loading.next(true);
        let tq = this.createTableQuery();
        let start = this._startIndex;
        let rowsToLoad = this._maxRows;
        if (!this.__refreshPagination) {
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
          this.__tableDisplayData?.(result.rows, undefined, this.groupByColumns?.[0]);
          setTimeout(() => {
            this.__refreshPagination?.(this._startIndex, this._maxRows, result.totalRows);
          });
        }
      },
      error: e => console.error(e)
    })
  }

  /**
   * @internal
   * @returns 
   */
  __onReload() {
    return this.reloadCue as Observable<any>;
  }

  // relayout() {
  //   this.__tableRelayout?.();
  // }

  /**
   * Get data being displayed in table. It doesn't returns all data in datasource.
   * @returns 
   */
  getData() {
    if (this.__data?.()) {
      return [...this.__data()];
    }
    return [];
  }

  /**
   * Get data being displayed in table as signal.
   * @returns 
   */
  getDataAsSignal() {
    return this.__data
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
   * To change default max rows for all tables across application, set `PanemuTableController.DEFAULT_MAX_ROWS`
   * at the start of application.
   * 
   * The value is limited by `PanemuTableController.MAX_ROWS_LIMIT`.
   */
  set maxRows(val: number) { this._maxRows = Math.min(val, PanemuTableController.MAX_ROWS_LIMIT) }

  /**
   * Get max rows from connected `PanemuPaginationComponent`.
   * 
   * To change default max rows for all tables across application, set `PanemuTableController.DEFAULT_MAX_ROWS`
   * at the start of application.
   */
  get maxRows() { return this._maxRows }

  /**
   * This is an internal method used by grouping functionality. Developer shouldn't need to call this method.
   * @param group
   * @internal 
   */
  __reloadGroup(group: RowGroup) {
    if (!group.controller) {
      group.controller = this.createGroupController(group);
    }
    group.controller.reloadCurrentPage();
  }

  private createGroupController(group: RowGroup) {
    let groupController = new PanemuTableController([], this.retrieveDataFunction);
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

    groupController.__tableDisplayData = (data: T[] | RowGroup[], parent?: RowGroup, groupField?: GroupBy) => {
      this.__tableDisplayData!(data, group, groupField);
    };

    return groupController;
  }

  private buildCriteriaRecursively(group: RowGroup, tableCriteria: TableCriteria[]) {
    if (group.parent) {
      this.buildCriteriaRecursively(group.parent, tableCriteria);
    }
    let val = group.column.type != null && group.column.type != undefined && group.column.type != ColumnType.STRING ? group.value : `"${group.value}"`;
    if (group.modifier == 'year') {
      let nextYear = +(group.value) + 1;
      val = `${group.value}-01-01.,${nextYear}-01-01`;
    } else if (group.modifier == 'month') {
      let endMonth = this.toDate(group.value + '-01');
      endMonth.setMonth(endMonth.getMonth() + 1);
      val = group.value + '-01' + '.,' + this.formatDateToIso(endMonth);

    }
    tableCriteria.push({ field: group.field, value: val });
    return tableCriteria;
  }

  private toDate(val: string) {
    let parts = val.split('-');
    return new Date(+parts[0], +parts[1] - 1, +parts[2])
  }

  private formatDateToIso(d?: Date): string | undefined {
    if (!d) {
      return undefined
    }

    if (typeof d == 'string') {
      return d;
    }

    var month = '' + (d.getMonth() + 1),
      day = '' + d.getDate(),
      year = d.getFullYear();

    if (month.length < 2)
      month = '0' + month;
    if (day.length < 2)
      day = '0' + day;

    return [year, month, day].join('-');
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
    if (this.__tableDisplayData) {
      this.reloadCue.next(performance.now())
    } else {
      setTimeout(() => {
        this.reloadCue.next(performance.now())
      });
    }
  }

  /**
   * Get selected row. A row is selected if user click it. RowGroup cannot be selected.
   * @returns 
   */
  getSelectedRow() {
    return this.__selectedRow()
  }

  /**
   * Get selected row as signal. A row is selected if user click it. RowGroup cannot be selected.
   * @returns 
   */
  getSelectedRowSignal() {
    return this.__selectedRow.asReadonly()
  }

  /**
   * Select a row in the table by row index or row object. RowGroup can't be selected.
   * @param rowOrIndex row index or row object
   * @returns true if the row index or row object is successfully selected. Return false if the object in selected index is a RowGroup or the row object is not in table data
   */
  selectRow(rowOrIndex: T | number) {
    if (!this.__data || !this.__rowOptions?.rowSelection) return false;

    if (typeof rowOrIndex == 'number') {
      const row = this.__data!()[rowOrIndex as number];
      if (row && !(row instanceof RowGroup)) {
        this.__selectedRow.set(row);
        return true;
      }
    } else if (this.__data().includes(rowOrIndex)) {
      this.__selectedRow.set(rowOrIndex);
      return true;
    }
    return false;
  }

  /**
   * Select the first non RowGroup row. If the table is groupped and none of the group is expanded, this function
   * will always return false because none will be selected.
   * @returns true if succesful in which there is a non RowGroup to select.
   */
  selectFirst() {
    if (this.__data) {
      for (const aRow of this.__data()) {
        if (!(aRow instanceof RowGroup)) {
          this.__selectedRow.set(aRow);
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
    this.__selectedRow.set(null)
  }
}