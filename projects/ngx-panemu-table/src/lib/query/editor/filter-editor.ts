import { WritableSignal } from "@angular/core";
import { BaseColumn } from "../../column/column";
import { Filter } from "../filter";
import { TableCriteria } from "../../table-query";

/**
 * Interface for `PanemuQueryComponent` filter editor. Custom filter editor should implements this interface.
 * Each properties should have Angular `@Input()` annotation.
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