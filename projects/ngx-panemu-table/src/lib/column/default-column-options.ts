/**
 * Default values for `BaseColumn` and its extension.
 * 
 * Override `PanemuTableService.getDefaultColumnOptions` method
 * to change it app-wide. Pass to `PanemuTableService.buildColumns` to provide default values for one single table.
 */
export interface DefaultColumnOptions {
  /**
   * Allow the column to be resized. Default true
   */
  resizable?: boolean

  /**
   * Display column in table. Default true.
   */
  visible?: boolean

  /**
   * Allow the column to be grouped. Default true.
   */
  groupable?: boolean

  /**
   * Allow the column to be sorted. Default true.
   */
  sortable?: boolean

  /**
   * Allow the column to be filtered. Default true.
   */
  filterable?: boolean
}