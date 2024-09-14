import { RowGroupModel } from "./row/row-group";

/**
 * Wrapper for rows to be displayed in a table. It also has total rows information.
 */
export class TableData<T> {

  /**
   * Data rows to display in table. It could by of T type or RowGroupModel.
   * If the request to datasource is about grouping data, this property will contains RowGroupModel instead of T type.
   * If pagination is applied, this property doesn't contain all data row.
   */
  rows: T[] | RowGroupModel[] = [];

  /**
   * Total of all row data. Used for pagination.
   */
  totalRows = 0;
}