import { CdkVirtualScrollViewport, ScrollingModule } from '@angular/cdk/scrolling';
import { CommonModule } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, effect, ElementRef, inject, Input, OnChanges, Signal, SimpleChanges, TemplateRef, Type, ViewChild, viewChildren, WritableSignal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { BehaviorSubject, Observable } from 'rxjs';
import { PanemuBusyIndicatorComponent } from './busy-indicator/panemu-busy-indicator.component';
import { SpinningIconComponent } from './busy-indicator/spinning-icon.component';
import { CellFormatterPipe } from './cell/cell-formatter.pipe';
import { CellRendererDirective } from './cell/cell-renderer.directive';
import { CellStylingPipe } from './cell/cell-styling.pipe';
import { GroupCellPipe } from './cell/group-cell.pipe';
import { HeaderRendererDirective } from './cell/header-renderer.directive';
import { BaseColumn, ColumnDefinition, ColumnType, HeaderRow, PropertyColumn } from './column/column';
import { TableOptions } from './option/options';
import { PanemuPaginationComponent } from './pagination/panemu-pagination.component';
import { PanemuTableController } from './panemu-table-controller';
import { PanemuTableService } from './panemu-table.service';
import { ResizableComponent } from './resizable.component';
import { ExpansionRow, ExpansionRowRenderer } from './row/expansion-row';
import { ExpansionRowRendererDirective } from './row/expansion-row-renderer.directive';
import { RowGroup, RowGroupData, RowGroupFooter } from './row/row-group';
import { RowGroupFooterRendererDirective } from './row/row-group-footer-renderer.directive';
import { RowGroupRendererDirective } from './row/row-group-renderer.directive';
import { RowStylingPipe } from './row/row-styling.pipe';
import { TableFooterRendererDirective } from './table-footer-renderer.directive';
import { GroupBy } from './table-query';
import { initTableWidth } from './util';

@Component({
  selector: 'panemu-table',
  standalone: true,
  imports: [
    MatMenuModule,
    CommonModule,
    MatButtonModule,
    ResizableComponent,
    CellRendererDirective,
    HeaderRendererDirective,
    RowGroupRendererDirective,
    PanemuBusyIndicatorComponent,
    PanemuPaginationComponent,
    SpinningIconComponent,
    RowStylingPipe,
    CellStylingPipe,
    GroupCellPipe,
    ExpansionRowRendererDirective,
    ScrollingModule,
    CellFormatterPipe,
    RowGroupFooterRendererDirective,
    TableFooterRendererDirective,
],
  // templateUrl: './panemu-table.component.html',
  templateUrl: './panemu-table.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PanemuTableComponent<T> implements AfterViewInit, OnChanges {
  @Input({required: true}) controller!: PanemuTableController<T>;
  dataSource: (T | RowGroup | RowGroupFooter | ExpansionRow<T>)[] = [];
  dataObservable = new BehaviorSubject<any[]>([])
  _visibleColumns!: PropertyColumn<T>[];
  _displayedColumns!: string[];
  loading!: Observable<boolean>
  _columnType = ColumnType;
  _controllerSelectedRowSignal!: Signal<T | null>;
  tableOptions!: TableOptions<T>;
  headers!:HeaderRow[];
  ready = false;
  cdr = inject(ChangeDetectorRef);
  pts = inject(PanemuTableService);
  labelTranslation = this.pts.getLabelTranslation();
  columnDefinition: ColumnDefinition<T> = {header:[], body: [], mutatedStructure: [], structureKey: '', __tableService: this.pts};
  @ViewChild('panemuTable', { read: ElementRef }) matTable!: ElementRef<HTMLElement>;

  @ViewChild(CdkVirtualScrollViewport)
  public viewPort!: CdkVirtualScrollViewport;
  headerTop = '0px';
  footerBottom = '0px';
  colElements = viewChildren<ElementRef<HTMLElement>>('colEl');
  constructor() {
    

    effect(() => {
      if (this.colElements() && this.colElements().length) {
        setTimeout(() => {
          this.initColumnWidth();
          this.resetStickyColumn();
        }, this.tableOptions?.calculateColumWidthDelay ?? 500);
      }
    })
    
  }

  private initColumnWidth() {
    const result = initTableWidth(this.matTable.nativeElement, true);
    if (this._visibleColumns.length) {
      Object.keys(result).forEach(k => {
        const clm = this._visibleColumns.find(item => item.__key == k);
        if (clm) {
          clm.width = result[k];
        }
      })
    }
  }

  ngAfterViewInit(): void {
    if (!!this.viewPort) {

      this.viewPort['_scrollStrategy'].onRenderedOffsetChanged = () => {
        this.headerTop = `-${this.viewPort.getOffsetToRenderedContentStart()}px`;
        this.footerBottom = `${this.viewPort.getOffsetToRenderedContentStart()}px`;
        this.cdr.detectChanges();
      };
    }

  }

  ngOnChanges(changes: SimpleChanges): void {

    if (changes['controller']) {
      this.onControllerChange()
    }
  }

  private relayout(rebuildHeader = true) {
    if (rebuildHeader) {
      this.pts['rebuildColumnDefinition'](this.columnDefinition);
    }
    this._visibleColumns = this.columnDefinition.body.filter(item => item.visible);
    this._displayedColumns = this._visibleColumns.map(item => item.__key!);
    this.resetStickyColumn();
    if (rebuildHeader) {
      this.cdr.markForCheck();
    }
  }

  resetStickyColumn() {
    let styleLeft = 0;
    
    for (let idx = 0; idx < this._visibleColumns.length; idx++) {
      let clm = this._visibleColumns[idx];
      if (clm.sticky == 'start') {
        clm.__leftStyle = styleLeft;
        const colWidth = this.colElements().at(idx)?.nativeElement.style.width;
        if (colWidth) {
          styleLeft += +colWidth.replace('px', '');
        }
      }
    }
    
    let styleRight = 0;
    for (let idx = this._visibleColumns.length - 1; idx >= 0; idx--) {
      let clm = this._visibleColumns[idx];
      if (clm.sticky == 'end') {
        clm.__rightStyle = styleRight;
        const colWidth = this.colElements().at(idx)?.nativeElement.style.width;
        if (colWidth) {
          styleRight += +colWidth.replace('px', '');
        }
      }
    }
    this.matTable?.nativeElement.setAttribute('resized','');
    if (styleLeft || styleRight) {
      this.cdr.markForCheck();
    }

    
  }

  afterColumnResize() {
    this.resetStickyColumn();
    this.controller.saveState();
  }

  private onControllerChange() {

    if (this.controller) {
      this.columnDefinition = this.controller.columnDefinition;
      if (this.controller.tableOptions.stateKey) {
        this.pts['rebuildColumnDefinition'](this.columnDefinition);
      }
      this.controller['tableDisplayData'] = this.displayData.bind(this);
      // this.controller.__data = this.data.asReadonly();
      this.controller['expandCell'] = this.expandCell.bind(this);
      this.controller.relayout = this.relayout.bind(this);
      this._controllerSelectedRowSignal = this.controller.getSelectedRowSignal();
      this.loading = this.controller.loading;
      
      this.headers = this.columnDefinition.header;
      this.columnDefinition.body.forEach(item => {
        item.__data = this.controller['data'].asReadonly();
        item.__expandHook = this.expandCell.bind(this)
      })
      this.relayout(false);

      this.tableOptions = this.controller.tableOptions;
      

      this.controller.refreshTable = this.refresh.bind(this);

      if (this.matTable?.nativeElement) {
        this.matTable.nativeElement.style.width = '';
        this.matTable.nativeElement.removeAttribute('resized');
      }
      // setTimeout(() => {
      //   this.ready = true;
      // });
      this.cdr.markForCheck();
    }
  }

  private displayData(data: T[] | RowGroupData[], parent?: RowGroup, groupField?: GroupBy) {

    const oriData: (T | RowGroup | RowGroupFooter | ExpansionRow<T>)[] = [...this.dataSource];
    
    let newRows: any[] = data;
    if (groupField) {
      //the data contains RowGroupModel
      let clm = this.columnDefinition.body.find(item => item.field == groupField.field)!;
      if (!clm) {
        throw new Error('Unknown column to group: ' + groupField.field);
      }
      newRows = data.map((i: any) => {
        const item = i as RowGroupData;
        let rg = new RowGroup(clm, item);
        rg.parent = parent;
        rg.level = parent ? parent.level + 1 : 0;
        rg.modifier = groupField.modifier;
        rg.formatter = groupField.modifier ? this.pts.getGroupModifierFormatter(groupField.modifier) : clm.formatter!;
        return rg;
      });
    }

    if (parent) {
      //the data is a group child. It could be inner group or of type T
      let idx = oriData.indexOf(parent);
      if (idx > -1) {
        /**
         * If the reload was triggered from pagination, this parent already has children. So clear it.
         */
        this.clearGroupChild(oriData, parent);
        if (parent.column.rowGroupRenderer?.footerComponent) {
          const footer = new RowGroupFooter(parent);
          newRows.push(footer)
        }
        oriData.splice(idx + 1, 0, ...newRows);
        this.resetDataSourceData([...oriData]);
      } else {
        console.warn('Unable to find index to insert data');
      }
    } else {
      //the data is of type T or RowGroup
      this.resetDataSourceData(newRows as (T[] | RowGroup[]));
    }
  }

  private resetDataSourceData(data: (T | RowGroup | RowGroupFooter | ExpansionRow<T>)[]) {
    this.dataSource = [...data];
    this.dataObservable.next(data);
    this.controller['data'].set(data);
    if (this.controller.getSelectedRow() && !this.controller['data']().includes(this.controller.getSelectedRow()!)) {
      this.controller.clearSelection();
    }
    this.cdr.markForCheck();
  }

  getDisplayedData() {
    return [...this.dataSource]
  }

  /**
   * This variable is for group expand action. Initiate this variable here to avoid unnecessary
   * change detection trigger in RowGroupRendererDirective
   */
  expandAction = this.groupHeaderClick.bind(this);

  groupHeaderClick(row: RowGroup) {
    row.expanded = !row.expanded;
    if (row.expanded) {
      this.controller['reloadGroup'](row);
    } else {
      this.keepColumnWidth();

      const oriData = [...this.dataSource];
      this.clearGroupChild(oriData, row);
      this.resetDataSourceData(oriData);
    }
  }

  /**
   * To avoid columns resizing when collapsing a group, let's keep the column width
   */
  private keepColumnWidth() {
    // if (!this.matTable.nativeElement.hasAttribute('resized')) {
    //   initTableWidth(this.matTable.nativeElement)
    // }
    // this.matTable.nativeElement.setAttribute('resized','');
  }

  private clearGroupChild(oriData: any[], row: RowGroup) {
    let groupIndex = oriData.indexOf(row);
    if (groupIndex > -1) {
      let nextId = -1;
      for (let index = groupIndex + 1; index < oriData.length; index++) {
        let otherRowGroup: RowGroup | null = null;
        if (oriData[index] instanceof RowGroupFooter) {
          const footerOwner = (oriData[index] as RowGroupFooter).rowGroup;
          if (footerOwner != row) {
            otherRowGroup = footerOwner;
          }
        } else if (oriData[index] instanceof RowGroup) {
          otherRowGroup = oriData[index];
        }
        if (otherRowGroup) {
          let level = otherRowGroup.level;
          if (level <= row.level) {
            nextId = index;
            break;
          }
        }
      }
      let removedCount = nextId > -1 ? nextId - groupIndex - 1 : oriData.length - groupIndex - 1;
      oriData.splice(groupIndex + 1, removedCount);
      // this.dataSource.filter = performance.now().toString();
    }
  }

  uniqueBy(a: any, key: any) {
    const seen: any = {};
    return a.filter((item: any) => {
      const k = key(item);
      return seen.hasOwnProperty(k) ? false : (seen[k] = true);
    });
  }

  isGroup(item: any): boolean {
    return item instanceof RowGroup;
  }

  isGroupFooter(item: any): boolean {
    return item instanceof RowGroupFooter;
  }

  sort(column: PropertyColumn<T>) {
    if (!column.sortable) return;

    let initialDirection = this.controller.sortedColumn[column.field.toString()] || '';
    if (initialDirection == 'asc') {
      this.controller.sortedColumn[column.field.toString()] = 'desc';
    } else if (initialDirection == 'desc') {
      delete this.controller.sortedColumn[column.field.toString()];
    } else {
      this.controller.sortedColumn[column.field.toString()] = 'asc';
    }

    this.controller.reloadCurrentPage();
    this.controller.saveState();
  }

  selectRow(row: T) {
    if (!this.tableOptions.rowOptions.rowSelection) {
      return;
    }
    this.controller.selectRow(row)
  }

  private refresh() {
    // const oriData = [...this.dataSource.data];
    // this.dataSource.data = [];
    // this.dataSource.data = oriData;
    this.onControllerChange();
  }

  isExpansionRow(item: any) {
    return item instanceof ExpansionRow
  }

  private collapseExpansion(row: T) {
    const existingDetail = this.dataSource.findIndex( item => (item instanceof ExpansionRow) && item.row == row);
    if (existingDetail >= 0) {
      (this.dataSource[existingDetail] as ExpansionRow<T>).expanded?.set(false);
      const oriData = [...this.dataSource];
      oriData.splice(existingDetail, 1);
      this.resetDataSourceData(oriData);  
    }
  }

  private expandCell(row: T, rowExpansionComponent: Signal<TemplateRef<any> | undefined> | Type<ExpansionRowRenderer<T>>, column: BaseColumn<T>, expanded?: WritableSignal<boolean>) {
    const existingRowExp = this.dataSource.find( item => (item instanceof ExpansionRow) && (item.row == row)) as ExpansionRow<T>;
    const oriData = [...this.dataSource];
    
    if (existingRowExp) {
      const existingIndex = this.dataSource.indexOf(existingRowExp);
      if (existingRowExp.column != column) {
        // the column is different. Replace the row detail
        existingRowExp.expanded?.set(false);
        oriData[existingIndex] = new ExpansionRow(row, rowExpansionComponent, column as PropertyColumn<T>, this.collapseExpansion.bind(this), expanded);
        expanded?.set(true);
      } else {
        // same column. It must be a close action
        existingRowExp.expanded?.set(false);
        oriData.splice(existingIndex, 1);
      }
    } else {
      const newRowExp = new ExpansionRow<T>(row, rowExpansionComponent, column as PropertyColumn<T>, this.collapseExpansion.bind(this), expanded);
      expanded?.set(true);
      const idx = oriData.indexOf(row);
      if (idx >= 0) {
        oriData.splice(idx + 1, 0, newRowExp);
      }
    }
    this.resetDataSourceData(oriData);
    this.cdr.markForCheck();
  }

}
