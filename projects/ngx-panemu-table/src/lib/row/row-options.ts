/**
 * Options related to table row such as enable or disable rowSelection, function to generate
 * dynamic row class and function to generate dynamic row style. It is used as one of parameter
 * to create `PanemuTableController`.
 */
export interface RowOptions<T> {

	/**
	 * Enable row selection. Default true
	 */
	rowSelection?: boolean;

	/**
	 * Row CSS class factory. The class is applied to `tr` element.
	 * @param row 
	 * @returns 
	 */
	rowClass?: (row: T) => string;

	/**
	 * Row CSS style factory. The style is applied to `tr` element.
	 * @param row 
	 * @returns 
	 */
	rowStyle?: (row: T) => string;
}