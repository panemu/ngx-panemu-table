import { WritableSignal } from "@angular/core";
import { BaseColumn } from "../../column/column";
import { TableCriteria } from "../../table-query";

/**
 * Interface for `PanemuQueryComponent` filter editor. Custom filter editor should implements this interface.
 */
export interface FilterEditor {
  /**
   * Column to filter on.
   */
  column: BaseColumn<any>

  /**
   * Filter to edit.
   */
  filter: TableCriteria

  /**
   * Callback function so `FilterEditorComponent` can get the criteria entered by user.
   */
  value: WritableSignal<string | undefined | null>
}