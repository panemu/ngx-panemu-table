import { effect, Signal, signal } from "@angular/core";
import { ColumnType, PropertyColumn, TickColumn } from "./column";
import { CellRenderer } from "../cell/cell";
import { TickCellComponent } from "../cell/tick-cell-renderer";
import { HeaderRenderer } from "../cell/header";
import { TickHeaderRenderer } from "../cell/tick-header-renderer";
import { RowGroup } from "../row/row-group";

/**
 * 
 */
export class TickColumnClass<T> implements PropertyColumn<T> {
  type = ColumnType.TICK;
  cellRenderer!: CellRenderer;
  headerRenderer?: HeaderRenderer;
  field!: any;
  __data!: Signal<T[]>;
  selections = signal<T[]>([]);

  constructor(tickColumn?: TickColumn<T>) {
    if (tickColumn) {
      Object.assign(this, tickColumn);
    }
    this.type = ColumnType.TICK;
    this.cellRenderer = tickColumn?.cellRenderer ||  {
      component: TickCellComponent,
    };
    const showCheckboxHeader = tickColumn?.checkBoxHeader === undefined ? true : tickColumn?.checkBoxHeader;
    this.headerRenderer = this.headerRenderer ? this.headerRenderer : showCheckboxHeader ? {component: TickHeaderRenderer} : undefined;

    effect(() => {
      if (this.__data()) {
        this.selections.set([]);
      }
    }, {allowSignalWrites: true});
  }

  /**
   * Set passed row to be ticked/unticked.
   * 
   * @param ticked true to tick
   * @param row row to tick or untick
   */
  setTicked(ticked: boolean, row: T) {
    
    if (ticked && !this.selections().includes(row)) {
      this.selections.update(vals => [...vals, row])
    } else if (!ticked && this.selections().includes(row)) {
      this.selections.update(vals => vals.filter(item => item != row))
    }
  }

  /**
   * Tick or untick row by row index. RowGroup can't be ticked.
   * 
   * @param ticked true to tick
   * @param index 
   * @returns 
   */
  setTickedByRowIndex(ticked: boolean, index: number) {
    if (index < 0 || this.__data().length <= index) {
      console.error(`Unable to tick index ${index} from range 0 - ${this.__data().length - 1}` )
      return;
    }
    const row = this.__data()[index];
    if (!(row instanceof RowGroup)) {
      this.setTicked(ticked, row);
    }
  }

  /**
   * Set all rows to be ticked / unticked. RowGroup can't be ticked.
   * 
   * @param ticked true to tick
   */
  setTickedAll(ticked: boolean) {
    if (ticked) {
      const indexes = [];
      for (let index = 0; index < this.__data().length; index++) {
        const item = this.__data()[index];
        if (!(item instanceof RowGroup)) {
          indexes.push(item);
        }
      }
      this.selections.set(indexes);
    } else {
      this.selections.set([]);
    }
  }

  /**
   * Check if passed row is ticked.
   * 
   * @param row 
   * @returns 
   */
  isTicked(row: T) {
    return this.selections().includes(row);
  }

  /**
   * Get list of ticked rows as signal
   * 
   * @returns 
   */
  getTickedRowsAsSignal() {
    return this.selections.asReadonly()
  }

  /**
   * Get ticked rows
   * @returns 
   */
  getTickedRows() {
    return this.selections();
  }
}