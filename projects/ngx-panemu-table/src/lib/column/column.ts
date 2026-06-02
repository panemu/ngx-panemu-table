import { Signal, TemplateRef, Type, WritableSignal } from "@angular/core";
import { CellFormatter, CellRenderer } from "../cell/cell";
import { HeaderRenderer } from "../cell/header";
import { PanemuTableService } from "../panemu-table.service";
import { RowGroupRenderer } from "../row/default-row-group-renderer";
import { ExpansionRowRenderer } from "../row/expansion-row";
import { TickColumnController } from "./tick-column-controller";
import { PanemuTableController } from "../panemu-table-controller";

/**
 * Interface for expanding cell to `ExpansionRow`. The generic T type is the data of row
 * containing the cell.
 */
export interface Expansion<T> {

  /**
   * `ng-template` or component to be rendered inside `ExpansionRow`.
   */
  component: Signal<TemplateRef<any> | undefined> | Type<ExpansionRowRenderer<T>>,

  cellRenderer?: CellRenderer,

  /**
   * Callback to disable expand button. By default the expand button is enabled.
   * @param row 
   * @returns 
   */
  isDisabled?: (row: T) => boolean,

  /**
   * Position of the expand button. Default is at the `start` of the cell.
   */
  buttonPosition?: 'start' | 'end'
}

/**
 * Column type discriminator. Drives default formatter, alignment,
 * filter editor and cell editor behaviour.
 *
 * - `'string'`   Default. Value displayed as is.
 * - `'int'`      Value is displayed right-aligned.
 * - `'decimal'`  Value is displayed right-aligned and formatted as local number incorporating angular LOCALE_ID.
 * - `'date'`     Value is displayed in 'EEE, d MMM yyyy' format.
 * - `'datetime'` Value is displayed in 'd MMM yyyy H:mm:ss' format.
 * - `'boolean'`  Boolean value.
 * - `'map'`      Used specifically by `MapColumn`. The value is displayed as configured in `valueMap` parameter.
 * - `'tick'`     Used specifically by `TickColumn`. Renders a checkbox cell driven by a `TickColumnController`.
 * - `'computed'` Used specifically by `ComputedColumn`. It doesn't have field parameter. The value to render is specified by the `formatter` argument.
 * - `'group'`    Groups several columns. Used by `GroupedColumn`.
 */
export type ColumnType =
  | 'string'
  | 'int'
  | 'decimal'
  | 'date'
  | 'datetime'
  | 'boolean'
  | 'map'
  | 'tick'
  | 'computed'
  | 'group';

export type StickyType = 'start' | 'end' | null;

export interface BaseColumn<T> {
  /**
   * Cue to specify default formatter and text alignment.
   * For example, if the type is DECIMAL than it will have thousand separator and right-aligned
   */
  type?: ColumnType

  /**
   * Stick the column horizontally.
   */
  sticky?: StickyType

  /**
   * Label for column header. Default is Title Case of the `field` property.
   */
  label?: string

  /**
   * Component to render in table cell. If unspecified, `DefaultCellRenderer` is used.
   */
  cellRenderer?: CellRenderer

  /**
   * Display column in table. Default true.
   */
  visible?: boolean

  /**
   * Column width in px. If undefined, it is up to the browser to calculate the optimum size.
   * If you find the browser doesn't calculate it properly, try to increase the value of `TableOptions.calculateColumnWidthDelay`.
   */
  width?: number

  /**
   * Column header renderer.
   * 
   * @see https://ngx-panemu-table.panemu.com/usages/custom-column-header
   */
  headerRenderer?: HeaderRenderer;

  /**
   * Allow the column to be resized. Default true
   */
  resizable?: boolean

  /**
     * Cell CSS class factory. The class is applied to `td` element.
     * @param value 
     * @param row 
     * @returns 
     */
  cellClass?: (value: any, row: T) => string;

  /**
   * Cell style factory. The style is applied to `td` element.
   * @param value 
   * @param row 
   * @returns 
   */
  cellStyle?: (value: any, row: T) => string;

  /**
   * Automatically generated. Always unique. It allows table to have multiple columns with the same field.
   */
  __key?: string

  /**
   * Header rowspan.
   * @internal
   */
  __rowSpan?: number

  /**
   * Header colSpan
   * @internal
   */
  __colSpan?: number

  /**
   * Indicates if table th is a group.
   * @internal
   */
  __isGroup?: boolean

  /**
   * Used to store the left style for sticky start
   * @internal
   */
  __leftStyle?: number;

  /**
   * Used to store the right style for sticky end
   * @internal
   */
  __rightStyle?: number;

  /**
   * Expansion row renderer. If this property is filled, the cell will have a button to expand.
   * The `rowComponent` property will be rendered in a new row just below the cell.
   * 
   * @see https://ngx-panemu-table.panemu.com/usages/cell-expansion
   */
  expansion?: Expansion<T>

  /**
   * @internal
   * @param row 
   * @param rowComponent 
   * @param column 
   * @param expanded 
   * @returns 
   */
  __expandHook?: (row: T,
    rowComponent: Signal<TemplateRef<any> | undefined> | Type<ExpansionRowRenderer<T>>,
    column: BaseColumn<T>,
    expanded: WritableSignal<boolean>
  ) => void
}

export interface PropertyColumn<T> extends LeafColumn<T> {
  field: keyof T

  /**
   * Allow the column to be grouped. Default true. This property is read by `PanemuQueryComponent`.
   */
  groupable?: boolean

  /**
   * Allow the column to be sorted. Default true.
   */
  sortable?: boolean;

  /**
   * Allow the column to be filtered. Default true. This property is read by `PanemuQueryComponent`.
   */
  filterable?: boolean;

  /**
   * Custom component to edit filter. Only relevant if `filterable` property is true.
   * 
   * @see https://ngx-panemu-table.panemu.com/usages/custom-filter-editor
   */
  // filterEditor?: Type<FilterEditor>

  /**
   * Consider to use `DefaultRowGroupRenderer.create` static method to customize it.
   * 
   * @see https://ngx-panemu-table.panemu.com/usages/custom-row-group
   */
  rowGroupRenderer?: RowGroupRenderer

}

export interface Column<T> extends PropertyColumn<T> {
  type?: 'string' | 'int' | 'decimal' | 'date' | 'datetime' | 'boolean'
}

export interface MapColumn<T> extends PropertyColumn<T> {
  type: 'map',

  /**
   * Key-Value pair to format the cell value as key, into it's corresponding value.
   * 
   * @see https://ngx-panemu-table.panemu.com/columns/map-column
   */
  valueMap: WritableSignal<{ [key: string]: any }> | { [key: string]: any }
}

export interface ComputedColumn<T> extends LeafColumn<T> {
  type: 'computed',
  formatter: CellFormatter<T>,
}

export interface TickColumn<T> extends LeafColumn<T> {

  type: 'tick',
  /**
   * Flag to show/hide checkbox in column header. Default true.
   */
  checkBoxHeader?: boolean

  isDisabled?: (row: T) => boolean

  controller: TickColumnController<T>
}

export interface LeafColumn<T> extends BaseColumn<T> {

  /**
   * Cell value formatter. If undefined, it will follow default setting based on `ColumnType`.
   */
  formatter?: CellFormatter<T>;

  getTableController?: () => PanemuTableController<T>

}

/**
 * Group several column headers. It works by incorporating `rowspan` and `colspan` th element attributes.
 */
export interface GroupedColumn<T> extends Pick<BaseColumn<any>, 'type' | 'label' | '__key'> {
  type: 'group'
  label: string
  children: (GroupedColumn<T> | ComputedColumn<T> | TickColumn<T> | PropertyColumn<T>)[]
  headerRenderer?: HeaderRenderer
}

// export interface DetailColumn {
//   type: ColumnType.DETAIL
//   label?: string
//   renderer: Signal<TemplateRef<any> | undefined> | Type<any>
// }

/**
 * Object returned by `PanemuTableService.buildColumns` method. It contains data to build
 * table header and table body.
 */
export interface HeaderRow {
  cells: BaseColumn<any>[]
}

/**
 * Wrapper for table header and body column information.
 * Do not create this object manually. It is generated by calling
 * `PanemuTableService.buildColumns()` method.
 */
export interface ColumnDefinition<T> {
  header: HeaderRow[];
  body: PropertyColumn<T>[];
  structureKey: string;
  mutatedStructure: (ComputedColumn<T> | TickColumn<T> | PropertyColumn<T> | GroupedColumn<T>)[];

  /**
   * This is a hack to transfer `PanemuTableService` to `PanemuTableController`.
   * It is to avoid API change.
   * @internal
   */
  __tableService: PanemuTableService
}

