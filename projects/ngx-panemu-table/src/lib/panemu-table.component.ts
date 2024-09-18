import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, effect, ElementRef, inject, Input, input, Signal, TemplateRef, Type, viewChild, ViewChild, WritableSignal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { Observable } from 'rxjs';
import { PanemuBusyIndicatorComponent } from './busy-indicator/panemu-busy-indicator.component';
import { SpinningIconComponent } from './busy-indicator/spinning-icon.component';
import { CellRendererDirective } from './cell/cell-renderer.directive';
import { CellStylingPipe } from './cell/cell-styling.pipe';
import { GroupCellPipe } from './cell/group-cell.pipe';
import { HeaderRendererDirective } from './cell/header-renderer.directive';
import { BaseColumn, ColumnDefinition, ColumnType, HeaderRow, PropertyColumn } from './column/column';
import { LabelTranslation } from './option/label-translation';
import { PanemuPaginationComponent } from './pagination/panemu-pagination.component';
import { PanemuTableController } from './panemu-table-controller';
import { PanemuTableService } from './panemu-table.service';
import { ResizableComponent } from './resizable.component';
import { ExpansionRow, ExpansionRowRenderer } from './row/expansion-row';
import { RowGroup, RowGroupData } from './row/row-group';
import { RowStylingPipe } from './row/row-styling.pipe';
import { GroupBy } from './table-query';
import { RowGroupRendererDirective } from './row/row-group-renderer.directive';
import { RowOptions } from '../public-api';
import { initTableWidth } from './util';
import { ExpansionRowRendererDirective } from './row/expansion-row-renderer.directive';

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
    ExpansionRowRendererDirective    
  ],
  templateUrl: './panemu-table.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PanemuTableComponent<T> {
  controller = input.required<PanemuTableController<T>>();
  dataSource: (T | RowGroup | ExpansionRow<T>)[] = [];
  _allColumns!: PropertyColumn<T>[];
  _visibleColumns!: PropertyColumn<T>[];
  _displayedColumns!: string[];
  loading!: Observable<boolean>
  _columnType = ColumnType;
  _controllerSelectedRowSignal!: Signal<T | null>;
  rowOptions!: RowOptions<T>;
  labelTranslation: LabelTranslation;
  columnDefinition: ColumnDefinition<T> = {header:[], body: []};
  headers!:HeaderRow[];
  ready = false;
  /**
   * Default is true. The table will take its container vertical space.
   * If false, the table will display all rows thus the height is adjusted automatically.
   */
  @Input() verticalScroll = true;
  cdr = inject(ChangeDetectorRef);

  @ViewChild('panemuTable', { read: ElementRef }) matTable!: ElementRef<HTMLElement>;
  constructor(private panemuTableService: PanemuTableService) {
    this.labelTranslation = this.panemuTableService.getLabelTranslation();
    effect(() => {
      this.onControllerChange()
    })

  }

  // ngOnChanges(changes: SimpleChanges): void {
  //   if (changes['controller']) {
  //     this.onControllerChange()
  //   }
  // }

  private onControllerChange() {

    if (this.controller()) {
      
      this.controller().__tableDisplayData = this.displayData.bind(this);
      // this.controller().__data = this.data.asReadonly();
      this.controller().__expandCell = this.expandCell.bind(this)
      this._controllerSelectedRowSignal = this.controller().getSelectedRowSignal();
      this.loading = this.controller().loading;
      
      this.columnDefinition = this.controller().columnDefinition;
      this.headers = this.columnDefinition.header;
      this._allColumns = this.columnDefinition.body as PropertyColumn<T>[];
      this._visibleColumns = [];
      this._allColumns.forEach(item => {
        item.__data = this.controller().__data.asReadonly();
        item.__expandHook = this.expandCell.bind(this)
        if (item.visible) {
          this._visibleColumns.push(item);
        }
      })

      this.initDefaultColumnWidthIfNeeded();
      this._displayedColumns = this._visibleColumns.map(item => item.__key!);

      this.controller().refreshTable = this.refresh.bind(this);

      this.rowOptions = this.controller().__rowOptions!;

      this.matTable?.nativeElement?.removeAttribute('resized');
      // setTimeout(() => {
      //   this.ready = true;
      // });
      this.cdr.markForCheck();
    }
  }

  private initDefaultColumnWidthIfNeeded() {
    const anyColumnHasSpecifiedWidth = !!this._visibleColumns.find(item => !!item.width);
    if (anyColumnHasSpecifiedWidth) {
      let totWidth = 0;
      this._visibleColumns.filter(item => item.visible).forEach(item => {
        if (!item.width || item.width < 10) {
          item.width = 150
        }
        totWidth += item.width
      })
      this.matTable.nativeElement.style.width = `${totWidth}px`;
    }
  }

  private displayData(data: T[] | RowGroupData[], parent?: RowGroup, groupField?: GroupBy) {

    const oriData: (T | RowGroup | ExpansionRow<T>)[] = [...this.dataSource];
    
    let finalData: T[] | RowGroupData[] | RowGroup[] = data;
    if (groupField) {
      //the data contains RowGroupModel
      let clm = this._allColumns.find(item => item.field == groupField.field)!;
      if (!clm) {
        throw new Error('Unknown column to group: ' + groupField.field);
      }
      finalData = data.map((i: any) => {
        const item = i as RowGroupData;
        let rg = new RowGroup();
        rg.field = groupField.field;
        rg.data = item;
        rg.parent = parent;
        rg.level = parent ? parent.level + 1 : 0;
        rg.column = clm;
        rg.modifier = groupField.modifier;
        rg.formatter = groupField.modifier ? this.panemuTableService.getGroupModifierFormatter(groupField.modifier) : clm.formatter!;
        return rg;
      });
    }

    if (parent) {
      //the data is a group child. It could be inner group or of type T
      let idx = oriData.indexOf(parent);
      if (idx > -1) {
        this.clearGroupChild(oriData, parent);
        oriData.splice(idx + 1, 0, ...(finalData as (T[] | RowGroup[])));
        this.resetDataSourceData([...oriData]);
      } else {
        console.warn('Unable to find index to insert data');
      }
    } else {
      //the data is of type T or RowGroup
      this.resetDataSourceData(finalData as (T[] | RowGroup[]));
    }
  }

  private resetDataSourceData(data: (T | RowGroup | ExpansionRow<T>)[]) {
    this.dataSource = data;
    this.controller().__data.set(data);
    if (this.controller().getSelectedRow() && !this.controller().__data().includes(this.controller().getSelectedRow()!)) {
      this.controller().clearSelection();
    }
  }

  getDisplayedData() {
    return [...this.dataSource]
  }


  groupHeaderClick(row: RowGroup) {
    row.expanded = !row.expanded;
    if (row.expanded) {
      this.controller().__reloadGroup(row);
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
    if (!this.matTable.nativeElement.hasAttribute('resized')) {
      initTableWidth(this.matTable.nativeElement)
    }
    this.matTable.nativeElement.setAttribute('resized','');
  }

  private clearGroupChild(oriData: (T | RowGroup | ExpansionRow<T>)[], row: RowGroup) {
    let groupIndex = oriData.indexOf(row);
    if (groupIndex > -1) {
      let nextId = -1;
      for (let index = groupIndex + 1; index < oriData.length; index++) {
        if (oriData[index] instanceof RowGroup) {
          let level = (<RowGroup>oriData[index]).level;
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

  isGroup(index: any, item: any): boolean {
    return item instanceof RowGroup;
  }

  sort(column: PropertyColumn<T>) {
    if (!column.sortable) return;

    let initialDirection = this.controller().sortedColumn[column.field.toString()] || '';
    if (initialDirection == 'asc') {
      this.controller().sortedColumn[column.field.toString()] = 'desc';
    } else if (initialDirection == 'desc') {
      delete this.controller().sortedColumn[column.field.toString()];
    } else {
      this.controller().sortedColumn[column.field.toString()] = 'asc';
    }

    this.controller().reloadCurrentPage();
  }

  selectRow(row: T) {
    if (!this.rowOptions?.rowSelection) {
      return;
    }
    this.controller().selectRow(row)
  }

  private refresh() {
    // const oriData = [...this.dataSource.data];
    // this.dataSource.data = [];
    // this.dataSource.data = oriData;
    this.onControllerChange();
  }

  isExpansionRow(index: any, item: any) {
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
