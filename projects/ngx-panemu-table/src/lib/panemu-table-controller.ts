import { Signal, signal, TemplateRef, Type, WritableSignal } from "@angular/core";
import { BehaviorSubject, catchError, finalize, Observable, of, skip, Subject, switchMap } from "rxjs";
import { BaseColumn, ColumnDefinition, ColumnType, GroupedColumn, NonGroupColumn } from "./column/column";
import { PanemuTableDataSource } from "./datasource/panemu-table-datasource";
import { TABLE_MODE } from "./editing/table-mode";
import { TableOptions } from "./option/options";
import { PanemuTableService } from "./panemu-table.service";
import { ExpansionRow, ExpansionRowRenderer } from "./row/expansion-row";
import { RowGroup, RowGroupData, RowGroupFooter } from "./row/row-group";
import { TableStateManager } from "./state/table-state-manager";
import { ColumnState, TableState } from "./state/table-states";
import { TableData } from "./table-data";
import { GroupBy, TableCriteria, TableQuery } from "./table-query";
import { formatDateToIso, isDataRow, mergeDeep, toDate } from "./util";
import { PanemuTableEditingController } from "./editing/panemu-table-editing-controller";

/**
 * Function to retrieve data based on pagination, sorting, filtering and grouping setting.
 * It is used for server side pagination, filtering, sorting and grouping. In this scenario,
 * it replace `PanemuTableDataSource`.
 * 
 * `startIndex`: zero-based row index to retrive.
 * 
 * `maxRows`: Maximum rows to fetch per page. To avoid user entering very big number that can bring server
 * or the browser down, override `PanemuTableService.getPaginationMaxRowsLimit`.
 * 
 * `groupController`: if true, then the request is triggered from a row group expansion
 */
export type RetrieveDataFunction<T> = (startIndex: number, maxRows: number, tableQuery: TableQuery, groupController?: boolean) => Observable<TableData<T>>;

export type RefreshPagination = (start: number, maxRows: number, totalRows: number) => void;

type DisplayDataFunction<T> = (data: T[] | RowGroupData[], parent?: RowGroup, groupField?: GroupBy) => void;

type ExpandCell<T> = (row: T, ExpansionRowComponent: Signal<TemplateRef<any> | undefined> | Type<ExpansionRowRenderer<T>>, column: BaseColumn<T>, expanded?: WritableSignal<boolean>) => void

/**
 * This class provide a way to interact with `PanemuTableComponent`. It requires columns information and a way
 * to get data.
 */
export class PanemuTableController<T> {

  /**
   * The value of this signal is set by table component. The table knows how to agregate the
   * row data, groups data etc.
   * @internal
   */
  private data = signal<(T | RowGroup | RowGroupFooter | ExpansionRow<T>)[]>([]);

  private selectedRow = signal<T | null>(null)
  groupByColumns: GroupBy[] = [];
  criteria: TableCriteria[] = [];
  private _mode = signal<TABLE_MODE>('browse');

  private _loading = new BehaviorSubject<boolean>(false);
  private _errorHandler!: (error: any) => void;

  /**
   * @internal
   */
  private tableDisplayData?: DisplayDataFunction<T>;
  private insertRowToTable?: (rowData: Partial<T>) => void;
  private deleteRowFromTable?: (rowData: T) => void;
  private expandCell?: ExpandCell<T>

  private refreshPagination?: RefreshPagination;
  private reloadCue = new BehaviorSubject(0);
  private afterReload$ = new Subject<TableData<T> | null>();
  private _startIndex = 0;
  private lastReloadTotalRows = 0;
  private _maxRows;
  private isGroupController = false;
  private stateInitialized = false;
  tableOptions: TableOptions<T>;
  sortedColumn: { [key: string]: 'asc' | 'desc' } = {};

  private hasPagination = false;
  private pts: PanemuTableService;
  private stateManager: TableStateManager;

  private _markForCheck!: Function;

  /**
   * Show dialog to customize column position, visibility and stickiness
   */
  showSettingDialog!: Function;

  /**
   * Transpose selected row and displayed in a dialog. While the dialog is shown
   * user can select a different row in the table.
   */
  transposeSelectedRow!: Function;

  private _editingController?: PanemuTableEditingController<T>;

  private constructor(public columnDefinition: ColumnDefinition<T>,
    private retrieveDataFunction: RetrieveDataFunction<T>,
    tableOptions?: Partial<TableOptions<T>>) {

    this.pts = columnDefinition.__tableService;
    this._errorHandler = tableOptions?.errorHandler ?? this.pts.handleError.bind(this.pts);
    this._maxRows = Math.min(this.pts.getPaginationMaxRows(), this.pts.getPaginationMaxRowsLimit());
    this.tableOptions = this.pts.getTableOptions();
    this.stateManager = new TableStateManager(this.pts);
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
    this.createSortingInfos(tq);
    tq.tableCriteria = [...this.criteria];
    return tq;
  }

  private createSortingInfos(tq: TableQuery) {
    for (const key in this.sortedColumn) {
      tq.sortingInfos.push({ field: key, direction: this.sortedColumn[key] });
    }
    if (tq.groupBy) {
      /**
       * Only include sorting info that match with group field because the other isn't relevant
       */
      tq.sortingInfos = tq.sortingInfos?.filter(item => item.field == tq.groupBy!.field);
    }
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
        if (!this.hasPagination) {
          start = 0;
          rowsToLoad = 0;
        }

        this._mode.set('browse');

        return this.retrieveDataFunction(start, rowsToLoad, tq, this.isGroupController).pipe(
          finalize(() => this._loading.next(false)),
          catchError(err => {
            this._errorHandler(err);
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
    this.hasPagination = true;
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

  /**
   * Get data being displayed in table. It only returns regular row data. It excludes `RowGroup`, 
   * `RowGroupFooter` and `ExpansionRow`. 
   * 
   * To get all data from table including of type `RowGroup`, `RowGroupFooter` and `ExpansionRow` see `getAllData` method.
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
   * Get data being displayed in table including `RowGroup`, `RowGroupFooter` and `ExpansionRow`.
   * If a `RowGroup` is collapsed, its children are not included because they aren't visible in the table.
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
  set maxRows(val: number) { this._maxRows = Math.min(val, this.pts.getPaginationMaxRowsLimit()) }

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
  reloadGroup(group: RowGroup, usePagination?: boolean) {
    if (!group.controller) {
      group.controller = this.createGroupController(group);
    }
    group.controller.hasPagination = usePagination ?? this.hasPagination;
    group.controller.reloadCurrentPage();
  }

  private createGroupController(group: RowGroup) {
    let groupController = new PanemuTableController({ header: [], body: [], mutatedStructure: [], structureKey: '', __tableService: this.pts }, this.retrieveDataFunction);
    groupController._maxRows = this._maxRows;
    groupController._mode = this._mode;
    groupController.isGroupController = true;
    let slicedGroupByColumn = group.parent ? group.parent.controller!.groupByColumns.slice(1) : this.groupByColumns.slice(1);
    groupController.groupByColumns = slicedGroupByColumn;
    groupController.createTableQuery = () => {
      let tq = this.createTableQuery();
      if (slicedGroupByColumn?.length) {
        tq.groupBy = slicedGroupByColumn[0];
      } else {
        delete tq.groupBy;
      }
      this.createSortingInfos(tq);
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
    let val;
    if (group.data.value === null || group.data.value === undefined) {
      val = 'NULL'
    } else {
      val = group.column.type != null && group.column.type != undefined && group.column.type != ColumnType.STRING ? group.data.value : `"${group.data.value}"`;
    }
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
   *  It will cancel `edit` or `insert` mode and back to `browse` mode.
   */
  reloadData() {
    this.startIndex = 0;
    this.reloadCurrentPage();
  }

  /**
   * Reload data without resetting pagination start index. It will cancel `edit` or `insert` mode and back to `browse` mode.
   */
  reloadCurrentPage() {

    if (this.tableOptions.saveState && !this.stateInitialized) {
      this.stateInitialized = true;
      this.readState().pipe(
        finalize(() => this.reloadCurrentPage())
      ).subscribe({
        next: state => {
          if (state) {
            this.restoreState(state);
          }

        },
        error: e => {
          console.error(e);
        }
      })

      return; //return here because the reloadCurrentPage() is called inside observable's pipe above.
    }

    if (this.tableDisplayData) {
      this.triggerReloadCue();
    } else {
      setTimeout(() => {
        this.triggerReloadCue();
      });
    }
  }

  private triggerReloadCue() {
    if (this._mode() != 'browse' && this._editingController?._getChangedData(this._mode()).length) {
      this._editingController?.canReload(this._editingController?._getChangedData(this._mode()), this._mode()).then(result => {
        if (result) {
          this.reloadCue.next(this.reloadCue.getValue() + 1)      
        }
      })
    } else {
      this.reloadCue.next(this.reloadCue.getValue() + 1)
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
  get selectedRowSignal() {
    return this.selectedRow.asReadonly()
  }

  /**
   * Select a row in the table by row index or row object. RowGroup can't be selected.
   * @param rowOrIndex row index or row object
   * @returns true if the row index or row object is successfully selected. Return false if the object in selected index is a RowGroup or the row object is not in table data
   */
  selectRow(rowOrIndex: T | number) {
    if (!this.data) {
      return false;
    }

    if (!this.tableOptions.rowOptions.rowSelection && this._mode() == 'browse') {
      return false;
    }

    let result = false;
    //let previouslySelected = this.selectedRow();

    if (typeof rowOrIndex == 'number') {
      const row = this.data!()[rowOrIndex as number];
      if (row && isDataRow(row)) {
        this.selectedRow.set(row as T);
        result = true;
      }
    } else if (this.data().includes(rowOrIndex)) {
      this.selectedRow.set(rowOrIndex);
      result = true;
    }
    // if (result && this._editingController && this._mode() != 'browse' && previouslySelected !== this.selectedRow()) {
    //   this._editingController?._startEdit(this.selectedRow()!);
    // }
    return result;
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

  /**
   * Expand cell. Only works if the column `BaseColumn.expansion` is defined.
   * @param row 
   * @param column 
   * @param expanded a signal to listen to expand/collapse state.
   * @see https://ngx-panemu-table.panemu.com/usages/cell-expansion
   */
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
   * Take a look at `exportToCsv` function as well.
   * 
   * @param options provide a way to exclude header or `RowGroup` rows.
   * @returns csv string
   */
  getCsvData(options?: { includeHeader?: boolean, includeRowGroup?: boolean }) {
    const csvOption = { includeHeader: true, includeRowGroup: true };
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
            csvRow.push(this.escapeCsvText(col.formatter(dataRow[col.field], dataRow) ?? ''))
          } else {
            csvRow.push(this.escapeCsvText(dataRow[col.field] + ''))
          }
        }
        csv.push(csvRow.join(','));
      }
    }

    return csv.join('\n');
  }

  private _relayout?: Function;

  /**
   * Called by setting component to repaint table header
   */
  relayout() {
    this._relayout?.()
  }

  /**
   * Save table states. The states are:
   * 1. Column visibility, order and stickiness
   * 2. Sorting
   * 3. Pagination
   * 4. Filtering
   * 5. Grouping
   * 
   * Saving state only works if `TableOptions.saveState` is defined. The key has to be unique app-wide.
   * The state is stored in local storage. To save in db server, override `PanemuTableService.saveTableState`.
   */
  saveState() {
    this.stateManager.saveTableState(this)
  }

  /**
   * Delete table state. By default, it reload the window after it.
   * 
   * @see `PanemuTableController.saveState`
   */
  deleteState(reloadAfterDelete = true) {
    this.stateManager.deleteTableState(this.tableOptions.saveState?.key).subscribe({
      next: (_: any) => {
        if (reloadAfterDelete) {
          window.location.reload()
        };
      }
      , error: e => {
        this._errorHandler(e)
      }
    })
  }

  /**
   * Read state.
   * @returns 
   * @see `PanemuTableController.saveState`
   */
  readState() {
    return this.stateManager.getSavedTableState(this.tableOptions.saveState?.key, this.columnDefinition.structureKey)
  }

  private restoreState(state: TableState) {
    const saveState = this.tableOptions.saveState;
    if (saveState?.states?.includes('criteria') ?? true) {
      this.criteria = state.criteria || [];
    }
    if (saveState?.states?.includes('groupByColumns') ?? true) {
      this.groupByColumns = state.groupByColumns || [];
    }
    if (saveState?.states?.includes('startIndex') ?? true) {
      this.startIndex = state.startIndex ?? 0;
    }
    if (saveState?.states?.includes('maxRows') ?? true) {
      this.maxRows = state.maxRows ?? this._maxRows;
    }
    if (saveState?.states?.includes('sorting') ?? true) {
      this.sortedColumn = state.sorting ?? {};
    }
    if ((saveState?.states?.includes('columns') ?? true) && state.columns) {
      const flattenStructure = this.getFlattenColumns(this.columnDefinition.mutatedStructure, []);
      const newStructure: (NonGroupColumn<T> | GroupedColumn)[] = [];
      for (const clmState of state.columns) {
        const actualColumn = flattenStructure.find(item => item.__key == clmState.key);
        if (!actualColumn) {
          console.error(`unable to restore state for column key ${clmState.key}`);
          return;
        }
        newStructure.push(actualColumn);
        if (clmState.children?.length) {
          const childStructure = this.restoreGroupState(clmState, flattenStructure);
          (actualColumn as GroupedColumn).children = childStructure;
        } else {
          this.copyState(clmState, actualColumn);
        }
      }
  
      this.columnDefinition.mutatedStructure = newStructure;
    }
    this.relayout();
  }

  private copyState(clmState: ColumnState, actualColumn: BaseColumn<any>) {
    actualColumn.width = clmState.width;
    actualColumn.visible = clmState.visible;
    actualColumn.sticky = clmState.sticky;
  }

  private restoreGroupState(groupState: ColumnState, flattenStructure: (NonGroupColumn<any> | GroupedColumn)[]) {
    const newStructure: (NonGroupColumn<T> | GroupedColumn)[] = [];
    for (const child of groupState.children!) {
      const actualColumn = flattenStructure.find(item => item.__key == child.key);
      if (!actualColumn) {
        console.error(`unable to restore state for column key ${child.key}`);
        return [];
      }
      newStructure.push(actualColumn);
      if (child.children?.length) {
        const childStructure = this.restoreGroupState(child, flattenStructure);
        (actualColumn as GroupedColumn).children = childStructure;
      } else {
        this.copyState(child, actualColumn);
      }
    }
    return newStructure;
  }

  private getFlattenColumns(columns: (NonGroupColumn<any> | GroupedColumn)[], result: (NonGroupColumn<any> | GroupedColumn)[]) {
    for (const clm of columns) {
      result.push(clm);
      if (clm.type == ColumnType.GROUP) {
        this.getFlattenColumns((clm as GroupedColumn).children, result);
      }
    }
    return result;
  }

  /**
   * Call angular `ChangeDetectorRef.markForCheck`
   */
  markForCheck() {
    this._markForCheck?.();
  }

  /**
   * It calls `getCsvData` method and instructs browser to download the data
   * as csv file.
   * 
   * @param options provide a way to exclude header or `RowGroup` rows.
   */
  exportToCsv(options?: { includeHeader?: boolean, includeRowGroup?: boolean }) {
    let csvString = this.getCsvData(options);
    const dl = "data:text/csv;charset=utf-8," + encodeURIComponent(csvString);
    window.location.href = dl;
  }

  set editingController(ec: PanemuTableEditingController<T> | undefined) {
    this._editingController = ec
    if (this._editingController) {
      this._editingController.pts = this.pts;
    }
  }

  get editingController() {
    return this._editingController;
  }

  get mode() {
    return this._mode.asReadonly()
  }

  private assertEditingController() {
    if (!this._editingController) {
      throw new Error('No PanemuTableEditingController assigned to PanemuTableController.editingController')
    }
  }
  
  /**
   * Change table mode to `edit`. It will throw an error if this controller
   * doesn't have `editingController`.
   */
  edit() {
    this.assertEditingController();
    if (this._mode() == "browse") {
      this._mode.set('edit')
    }
  }

  /**
   * Change table mode to `insert` and insert new row at the first index. It will throw an error if this controller
   * doesn't have `editingController`.
   */
  insert() {
    this.assertEditingController();
    let newRowData = this._editingController?.createNewRowData() as T;
    if (this._mode() == 'browse' && newRowData) {
      this._mode.set('insert');
    }
    if (this._mode() == 'insert' && newRowData) {
      this.insertRowToTable?.(newRowData)
    }
  }

  /**
   * Save changed rows. This method does the followings:
   * 
   * 1. Call `editingController._getChangedData`
   * 2. Call `editingController._validate`. It executes validation on cell basis.
   * 3. Call `editingController.canSave`. It is a hook to allow user to cancel the save operation or
   * doing row level validation.
   * 4. Call `editingController.saveData`. It saves the data to server.
   * 5. Call `editingController.afterSuccessfulSave`. It is a hook to do something after the data is saved.
   * 6. Change mode to `browse`.
   * 
   * @returns 
   */
  async save() {
    this.assertEditingController();
    if (this._loading.getValue()) return;
    if (this._mode() != 'browse') {
      let changed = this._editingController?._getChangedData(this._mode());

      if (changed?.length) {
        for (const row of changed) {
          let valid = this._editingController?._validate(row);
          if (!valid) {
            this.selectRow(row)
            return;
          }
        }
        if (!(await this._editingController?.canSave(changed, this._mode()))) {
          return;
        }
        this._loading.next(true)
        this._editingController?.saveData(changed, this.mode()).pipe(
          finalize(() => this._loading.next(false))
        ).subscribe({
          next: savedRowData => {
            if (savedRowData?.length) {
              for (let index = 0; index < savedRowData.length; index++) {
                const saved = savedRowData[index];
                mergeDeep(changed[index], saved)
              }
            }
            this._editingController?.afterSuccessfulSave(changed, this._mode());
            this._mode.set('browse')
          },
          error: e => this._errorHandler(e)
        })
      } else {
        this._mode.set('browse');
      }
    }
  }

  /**
   * In browse mode, it will execute `PanemuTableEditingController.deleteData` method.
   * In insert mode, it will just remove the inserted row from the table.
   */
  deleteSelectedRow() {
    this.assertEditingController();
    let rowToDel = this.selectedRowSignal();
    if (!rowToDel) return;
    if (this._loading.getValue()) return;
    this._editingController?.canDelete(rowToDel, this._mode()).then(result => {
      if (result) {
        if (this._mode() == 'insert') {
          this.deleteRowFromTable?.(rowToDel)
          if (!this._editingController?._getChangedData(this._mode())?.length) {
            this._mode.set('browse');
          }
        } else if (this._mode() == 'browse') {
          this._loading.next(true)
          this._editingController?.deleteData(rowToDel).pipe(
            finalize(() => this._loading.next(false))
          ).subscribe({
            next: _ => {
              this.deleteRowFromTable?.(rowToDel);
              this._editingController?.afterSuccessfulDelete(_);
            },
            error: e => this._errorHandler(e)
          })
        }
      }
    })
  }

  onDoubleClick(row: T) {
    if (this._mode() == 'browse') {
      this.tableOptions.rowOptions?.onDoubleClick?.(row)
    }
  }

  set errorHandler(handler: ((error: any) => void) | null) {
    this._errorHandler = handler ?? this.pts.handleError.bind(this.pts)
  }

}