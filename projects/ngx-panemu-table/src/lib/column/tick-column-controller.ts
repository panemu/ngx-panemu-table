import { signal } from "@angular/core";
import { isDataRow } from "../util";

/**
 *
 */
export class TickColumnController<T>  {
  private __data = signal<T[]>([]);
  private __selections = signal<T[]>([]);
  

  isAllSelected() {
    if (!this.__data().length) return false;
    const selectedCount = this.__selections().length;
    const rowCount = this.__data()?.filter(item => isDataRow(item)).length;
    return selectedCount == rowCount;
  }

  /**
   * Set passed row to be ticked/unticked.
   *
   * @param ticked true to tick
   * @param row row to tick or untick
   */
  setTicked(ticked: boolean, row: T) {

    if (ticked && !this.__selections().includes(row)) {
      this.__selections.update(vals => [...vals, row])
    } else if (!ticked && this.__selections().includes(row)) {
      this.__selections.update(vals => vals.filter(item => item != row))
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
    if (isDataRow(row)) {
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
        if (isDataRow(item)) {
          indexes.push(item);
        }
      }
      this.__selections.set(indexes);
    } else {
      this.__selections.set([]);
    }
  }

  /**
   * Check if passed row is ticked.
   *
   * @param row
   * @returns
   */
  isTicked(row: T) {
    return this.__selections().includes(row);
  }

  /**
   * Get list of ticked rows as signal
   *
   * @returns
   */
  get tickedRowsSignal() {
    return this.__selections.asReadonly()
  }

  /**
   * Get ticked rows
   * @returns
   */
  getTickedRows() {
    return this.__selections();
  }
}
