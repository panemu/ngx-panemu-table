import { Predicate } from "./query/query-builder/types";

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
  where?: Predicate | null= null;

  /**
   * Sorting info
   */
  orderBy: SortingInfo[] = [];

  /**
   * Timezone info, in IANA timezone format, e.g. "America/New_York". This is useful when the table has date/datetime column and the data source is in different timezone than the user interface. With this information, the data source can convert the date/datetime value to correct timezone before doing grouping, sorting or filtering.
   */
  zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
}