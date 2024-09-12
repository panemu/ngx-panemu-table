import { RowGroup } from "./row/row-group";
import { ExpansionRow } from "./row/expansion-row";

/**
 * Function to check if passed row is a data row. There are 3 object types that can be displayed
 * in `PanemuTableComponent`: RowGroup, ExpansionRow and the actual data.
 * 
 * @param row object to check
 * @returns true if row is not RowGroup nor ExpansionRow
 */
export function isDataRow(row: any) {
	return !(row instanceof ExpansionRow) && !(row instanceof RowGroup)
}