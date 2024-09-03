export type SortingDirection = 'asc' | 'desc';

/**
 * Interface for grouping functionality.
 */
export interface GroupBy {

  /**
   * Field used to group
   */
  field: string;

  /**
   * For DATE and DATETIME field, the modifier is one of `day`, `month` or `year`.
   * Other type of field doesn't have modifier.
   */
  modifier?: string;
}

/**
 * Interface for sorting functionality
 */
export interface SortingInfo {

  /**
   * Field to sort
   */
  field: string;

  /**
   * Sorting direction. Either `asc` or `desc`.
   */
  direction: SortingDirection;
}

/**
 * Interface for filtering functionality
 */
export interface TableCriteria {

  /**
   * Field to filter on.
   */
  field: string;

  /**
   * Filter predicate.
   */
  value: any;
}

/**
 * Wrapper of grouping, sorting and filtering information. This class instance if sent
 * to `PanemuTableDataSource` or `RetrieveDataFunction` when loading table data, sorting,
 * grouping, filtering or changing page.
 */
export class TableQuery {
  /**
   * Grouping info
   */
  groupBy?: GroupBy;

  /**
   * Filtering info
   */
  tableCriteria: TableCriteria[] = [];

  /**
   * Sorting info
   */
  sortingInfos: SortingInfo[] = [];

  /**
   * UTC minute offset. Useful for handling timezone in server side query
   */
  utcMinuteOffset = (new Date).getTimezoneOffset();
}