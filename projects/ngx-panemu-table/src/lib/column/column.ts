import { Signal, TemplateRef, Type, WritableSignal } from "@angular/core";
import { CellFormatter, CellRenderer } from "../cell/cell";
import { HeaderRenderer } from "../cell/header";
import { ExpansionRow, ExpansionRowRenderer } from "../row/expansion-row";
import { RowGroup } from "../row/row-group";
import { TickColumnClass } from "./tick-column-class";
import { FilterEditor } from "../query/editor/filter-editor";
import { RowGroupRenderer } from "../row/default-row-group-renderer";

export interface Expansion<T> {
  component: Signal<TemplateRef<any> | undefined> | Type<ExpansionRowRenderer<T>>,
  isDisabled?: (row: T) => boolean,
  buttonPosition?: 'start' | 'end'
}

export enum ColumnType {
  /**
   * Default type. Value is displayed as is.
   */
  STRING,

  /**
   * Value is displayed right-aligned 
   */
  INT,

  /**
   * Value is displayed right-aligned and formatted as local number incorporating angular LOCALE_ID
   */
  DECIMAL,

  /**
   * Value is displayed in 'EEE, d MMM yyyy' format.
   */
  DATE,

  /**
   * Value is displayed in 'd MMM yyyy H:mm:ss' format.
   */
  DATETIME,

  /**
   * Used specifically by `MapColumn`. The value is displayed as configured in `valueMap` parameter.
   */
  MAP,

  /**
   * Used specifically by `TickColumnClass`
   */
  TICK,

  /**
   * Used specifically by `ComputedColumn`. It doesn't have field parameter. The value to render
   * is specified by the `formatter` argument.
   */
  COMPUTED,

  /**
   * Groups several columns. Used by `GroupedColumn`.
   */
  GROUP,
}

type StickyType = 'start' | 'end' | null;

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
   * Component to render in table cell
   */
  cellRenderer?: CellRenderer

  /**
   * Display column in table. Default true.
   */
  visible?: boolean

  /**
   * If all columns doesn't have width defined, the table will let browser to decide the column width.
   * If at least one of the column has width defined then columns without width defined will have
   * the same width (150px).
   */
  width?: number

  /**
   * Column header renderer.
   */
  headerRenderer?: HeaderRenderer;

  /**
   * For internal use
   * @internal
   */
  __data?: Signal<(T | RowGroup | ExpansionRow<T>)[]>

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
  cellClass?: (value: any, row?: T) => string;

  /**
   * Cell style factory. The style is applied to `td` element.
   * @param value 
   * @param row 
   * @returns 
   */
  cellStyle?: (value: any, row?: T) => string;

  /**
   * Automatically generated. Must be unique. It allows table to have multiple columns with the same field.
   * @internal
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

export interface PropertyColumn<T> extends BaseColumn<T> {
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
   * Cell value formatter. If undefined, it will follow default setting based on `ColumnType`.
   */
  formatter?: CellFormatter;

  /**
   * Allow the column to be filtered. Default true. This property is read by `PanemuQueryComponent`.
   */
  filterable?: boolean;

  /**
   * Custom component to edit filter. Only relevant if `filterable` property is true.
   */
  filterEditor?: Type<FilterEditor>

  rowGroupRenderer?: RowGroupRenderer
}

export interface Column<T> extends PropertyColumn<T> {
  type?: ColumnType.STRING | ColumnType.INT | ColumnType.DECIMAL | ColumnType.DATE | ColumnType.DATETIME
}

export interface MapColumn<T> extends PropertyColumn<T> {
  type?: ColumnType.MAP,

  /**
   * Key-Value pair to format the cell value as key, into it's corresponding value.
   */
  valueMap: WritableSignal<{ [key: string]: any }> | { [key: string]: any }
}

export interface ComputedColumn extends BaseColumn<any> {
  type: ColumnType.COMPUTED,
  formatter: CellFormatter,
}

export interface TickColumn<T> extends BaseColumn<T> {

  /**
   * Flag to show/hide checkbox in column header. Default true.
   */
  checkBoxHeader?: boolean

  isDisabled?: (row: T) => boolean
}

export type NonGroupColumn<T> = Column<T> | MapColumn<T> | TickColumnClass<T> | ComputedColumn;

/**
 * Group several column headers. It works by incorporating `rowspan` and `colspan` th element attributes.
 */
export interface GroupedColumn {
  type: ColumnType.GROUP
  label: string
  children: (GroupedColumn | NonGroupColumn<any>)[]
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
  keys: string[]
}

/**
 * Wrapper for table header and body column information.
 * Do not create this object manually. It is generated by calling
 * `PanemuTableService.buildColumns()` method.
 */
export interface ColumnDefinition<T> {
  header: HeaderRow[]
  body: PropertyColumn<T>[]
}

