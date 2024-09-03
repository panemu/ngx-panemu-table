import { CommonModule } from '@angular/common';
import { Component, effect, ElementRef, input, Signal, signal, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatTable, MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Observable } from 'rxjs';
import { BusyIndicatorComponent } from './busy-indicator/busy-indicator.component';
import { SpinningIconComponent } from './busy-indicator/spinning-icon.component';
import { CellRendererDirective } from './cell/cell-renderer.directive';
import { CellStylingPipe } from './cell/cell-styling.pipe';
import { HeaderRendererDirective } from './cell/header-renderer.directive';
import { ColumnType, PropertyColumn } from './column/column';
import { PanemuPaginationComponent } from './pagination/panemu-pagination.component';
import { PanemuTableController } from './panemu-table-controller';
import { PanemuTableService } from './panemu-table.service';
import { ResizableComponent } from './resizable.component';
import { RowGroup } from './row/row-group';
import { RowOptions } from './row/row-options';
import { RowStylingPipe } from './row/row-styling.pipe';
import { GroupBy } from './table-query';
import { LabelTranslation } from './option/label-translation';

@Component({
  selector: 'panemu-table',
  standalone: true,
  imports: [
    MatTableModule,
    MatMenuModule,
    CommonModule,
    MatButtonModule,
    ResizableComponent,
    CellRendererDirective,
    HeaderRendererDirective,
    BusyIndicatorComponent,
    PanemuPaginationComponent,
    SpinningIconComponent,
    RowStylingPipe,
    CellStylingPipe
  ],
  templateUrl: './panemu-table.component.html',
})
export class PanemuTableComponent<T> {
  controller = input.required<PanemuTableController<T>>();
  dataSource = new MatTableDataSource<T | RowGroup>([]);
  _allColumns!: PropertyColumn<T>[];
  _columns!: PropertyColumn<T>[];
  _displayedColumns!: string[];
  loading!: Observable<boolean>
  // sortingInfo: SortingInfo = { field: '', direction: 'asc' };
  _columnType = ColumnType;
  _controllerSelectedRowSignal!: Signal<T | null>;
  rowOptions!: RowOptions<T>;
  labelTranslation: LabelTranslation;
  private columnWidthInitialized = false;
  private data = signal<(T | RowGroup)[]>([]);

  @ViewChild('panemuTable', { read: ElementRef }) matTable!: ElementRef<HTMLElement>;
  @ViewChild(MatTable) table!: MatTable<any>;
  constructor(private panemuTableService: PanemuTableService) {
    this.labelTranslation = this.panemuTableService.getLabelTranslation();
    effect(() => {
      this.onControllerChange()
    })

    effect(() => {
      if (this.controller().getSelectedRow()) {
        if (!this.data().includes(this.controller().getSelectedRow()!)) {
          this.controller().clearSelection();
        }
      }
    }, { allowSignalWrites: true })
  }

  private onControllerChange() {

    if (this.controller()) {
      this.columnWidthInitialized = false;
      this.controller().__tableDisplayData = this.displayData.bind(this);
      this.controller().__data = this.data.asReadonly();
      this._controllerSelectedRowSignal = this.controller().getSelectedRowSignal();
      this.loading = this.controller().loading;
      this._allColumns = this.controller().columns as PropertyColumn<T>[];
      this._allColumns.forEach(item => item.__data = this.data.asReadonly())

      this._columns = (this.controller().columns as PropertyColumn<T>[]).filter(item => !!item.field);
      this._displayedColumns = this._allColumns.filter(item => item.visible).map(item => item.__key!);

      this.controller().refreshTable = this.refresh.bind(this);

      this.rowOptions = this.controller().__rowOptions!;
    }
  }

  private displayData(data: T[] | RowGroup[], parent?: RowGroup, groupField?: GroupBy) {

    const oriData = [...this.dataSource.data];
    
    if (data?.length && !this.columnWidthInitialized) {
      const anyColumnHasSpecifiedWidth = !!this._columns.find(item => !!item.width);
      if (anyColumnHasSpecifiedWidth) {
        let totWidth = 0;
        this._columns.filter(item => item.visible).forEach(item => {
          if (!item.width || item.width < 10) {
            item.width = 150
          }
          totWidth += item.width
        })
        this.matTable.nativeElement.style.width = `${totWidth}px`;
      }
    }
    let finalData: T[] | RowGroup[] = data;
    if (groupField) {
      let clm = this._columns.find(item => item.field == groupField.field)!;
      if (!clm) {
        throw new Error('Unknown column to group: ' + groupField.field);
      }
      finalData = data.map((item: any) => {
        let rg = new RowGroup();
        rg.field = groupField.field;
        rg.count = item.count;
        rg.value = item.value;
        rg.parent = parent;
        rg.level = parent ? parent.level + 1 : 0;
        rg.column = clm;
        rg.modifier = groupField.modifier;
        rg.formatter = groupField.modifier ? this.panemuTableService.getGroupModifierFormatter(groupField.modifier) : clm.formatter!;
        return rg;
      });
    }
    if (parent) {
      let idx = oriData.indexOf(parent);
      if (idx > -1) {
        this.clearGroupChild(oriData, parent);
        oriData.splice(idx + 1, 0, ...finalData);
        this.resetDataSourceData([...oriData]);
      } else {
        console.warn('Unable to find index to insert data');
      }
    } else {
      this.resetDataSourceData(finalData);
    }
    this.table.renderRows();
  }

  private resetDataSourceData(data: (T | RowGroup)[]) {
    this.dataSource.data = data;
    this.data.set(data);
  }

  getDisplayedData() {
    return [...this.dataSource.data]
  }


  groupHeaderClick(row: RowGroup) {
    row.expanded = !row.expanded;
    if (row.expanded) {
      this.controller().__reloadGroup(row);
    } else {
      const oriData = [...this.dataSource.data];
      this.clearGroupChild(oriData, row);
      this.resetDataSourceData(oriData);
      this.table.renderRows();
    }
  }

  private clearGroupChild(oriData: (T | RowGroup)[], row: RowGroup) {
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
    console.log('refresh');
    // const oriData = [...this.dataSource.data];
    // this.dataSource.data = [];
    // this.dataSource.data = oriData;
    this.onControllerChange();
  }
}
