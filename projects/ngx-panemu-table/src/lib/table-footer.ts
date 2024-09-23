/**
 * Interface for table footer component. The template should contains one or more td or th element.
 * The host css display property must be set to `contents`.
 */
export interface TableFooterComponent {
	colSpan: number;
	parameter?: any;
}