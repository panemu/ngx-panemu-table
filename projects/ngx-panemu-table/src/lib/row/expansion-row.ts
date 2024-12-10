import { isSignal, Signal, TemplateRef, Type, WritableSignal } from "@angular/core";
import { PropertyColumn } from "../column/column";

/**
 * If expansion cell is expanded, a new instance of `ExpansionRow` will be added to
 * `PanemuTableDataSource` data. The instance has necessary information for `PanemuTableComponent`
 * to render it in table body.
 */
export class ExpansionRow<T> {

  constructor(
    /**
     * This is the row from which the expansion is from
     */
    public row: T,
    /**
     * Component to render
     */
    public component: Signal<TemplateRef<any> | undefined> | Type<ExpansionRowRenderer<T>>,
    /**
     * Column of expansion cell that trigger the display of expansion row
     */
    public column: PropertyColumn<T>,
    /**
     * Close callback to collapse the expansion row
     */
    public closeCallback: (row: T) => void,
    /**
     * Used by table row to decide whether to expand/collapse or replace the expansion row
     * with other expansion row
     * 
     * @internal
     */
    public expanded?: WritableSignal<boolean>
  ) { 
  }

  isTemplateRef() {
    return isSignal(this.component)
  }

  close() {
    this.closeCallback(this.row)
  }

}

/**
 * Interface for UI component to render inside `ExpansionRow`
 */
export interface ExpansionRowRenderer<T> {
  /**
   * Row data related to expansion row
   */
  row: T;
  /**
   * Column of expansion cell that trigger the expansion
   */
  column: PropertyColumn<T>
  /**
   * Close function to collapse the expansion.
   */
  close: Function
}