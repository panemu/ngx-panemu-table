import { GroupBy, TableCriteria } from "../table-query";

/**
 * Column states
 */
export interface ColumnState {
  /**
   * Generated key
   */
  key: string

  /**
   * Width in px
   */
  width?: number
  sticky?: 'start' | 'end' | null
  visible: boolean
  children?: ColumnState[]
}

/**
 * States of table that can be saved and restored. The `TableOptions.stateKey` must be
 * uniquely defined to enable persisting states.
 */
export interface TableState {
  /**
   * Generated key to ensure the column structure doesn't change. It is concatenated
   * BaseColumn.__key of the columns. If a column is added or removed, or children of
   * `ColumnType.GROUP` column is changed, the generated structureKey will be different
   * thus saved state is ignored.
   */
  structureKey: string;

  /**
   * State from `PanemuTableController.groupByColumns`.
   */
  groupByColumns?: GroupBy[];

  /**
   * State from `PanemuTableController.criteria`.
   */
  criteria?: TableCriteria[];

  /**
   * State of pagination start index.
   */
  startIndex: number;

  /**
   * State of pagination max rows
   */
  maxRows: number;

  /**
   * Sorting state
   */
  sorting: { [key: string]: 'asc' | 'desc' };

  /**
   * Column structure state
   */
  columns: ColumnState[];
}
