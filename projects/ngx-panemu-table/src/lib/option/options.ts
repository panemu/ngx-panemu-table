import { Signal, TemplateRef, Type } from "@angular/core";
import { TableFooterComponent } from "../table-footer";
import { PropertyColumn } from "../column/column";
import { TableState } from "../state/table-states";

/**
 * Interface for custom row renderer. The template root component should be a tr element.
 *
```html
<ng-template #rowRenderer 
  let-row="row" 
  let-visibleColumns="visibleColumns" 
  let-rowOptions="rowOptions"
  let-selectedRow="selectedRow"
  let-selectRow="selectRow"
>
  <tr>
    <td *ngFor="let column of visibleColumns">
      {{row[column.field]}}
    </td>
  </tr>
</ng-template>
```
@see https://ngx-panemu-table.panemu.com/usages/cell-spanning
 */
export interface RowRenderer<T> {
  /**
   * Row to render
   */
  row: T;

  /**
   * List of visible column. It is derived from `ColumnDefinition.body`.
   */
  visibleColumns: PropertyColumn<T>[];

  /**
   * Provides reference to rowClass and rowStyle factories.
   */
  rowOptions: RowOptions<T>;

  /**
   * A signal to check if current row is selected.
   */
  selectedRow: Signal<T | null>;

  /**
   * A function to select current row
   * @param row 
   * @returns 
   */
  selectRow: (row: T) => void;
}

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

  /**
   * Callback for double click on data row. If table is not in browse mode, it isn't called.
   * @param row data
   */
  onDoubleClick?: (row: T) => void;

  /**
   * It provides a way to build your own tr-td tags in the table body for example
   * if you need to implement cell or row spanning.
   * 
   * @see https://ngx-panemu-table.panemu.com/usages/cell-spanning
   */
  rowRenderer?: Signal<TemplateRef<RowRenderer<T>> | undefined>
}

/**
 * Interface for table footer.
 * 
 * @see https://ngx-panemu-table.panemu.com/usages/virtual-scroll
 */
export interface FooterRenderer {
  /**
   * Template or component for the footer. It should contains one or more td or th elements.
   * If it is a component, the host css display property must be set to `contents`. 
   */
  component: Type<TableFooterComponent> | Signal<TemplateRef<any> | undefined>
  parameter?: any
};

/**
 * Options to configure some of the table behavior. The default value is in `PanemuTableService.getTableOptions`.
 */
export interface TableOptions<T> {
  /**
   * Enable virtual scroll for handling huge data. Default is false.
   * If it is true, the `autoHeight` option is ignored. The vertical scrolling
   * will be always enabled.
   */
  virtualScroll: boolean;

  /**
   * The height for row. It is used to calculate the virtual scroll viewport
   * height. By default the value is 32 following the default NgxPanemuTable
   * style. If you customize the row height css style, ensure to set the correct value
   * for this property.
   */
  virtualScrollRowHeight: number;

  /**
   * Default is false. The table will take its container vertical space. Vertical scrollbar is visible when needed.
   * If true, the table will display all rows thus the height is adjusted automatically and the vertical scollbar
  * won't be visible.
   */
  autoHeight: boolean;

  /**
   * Table footer component/template.
   * 
   * @see https://ngx-panemu-table.panemu.com/usages/virtual-scroll
   */
  footer?: FooterRenderer | null,

  /**
   * Options related to table row.
   */
  rowOptions: RowOptions<T>

  /**
   * Delay in milliseconds to calculate the width of table columns. Default value is 500.
   * If `BaseColumn.width` is not specified, we'll let browser to calculate
   * the optimum width for the column. After this delay, we run a logic to get
   * the width and put it in col element width style. It is required to support multiple
   * sticky columns. It also allows us to only specify width to certain columns
   * while other columns get browser calculated width.
   * 
   * If its value is 0, this feature is disabled.
   */
  calculateColumnWidthDelay: number

  /**
   * Save table states to local storage. The key should be unique app-wide. The states
   * define what to save. If undefined, all states are saved.
   * @see https://ngx-panemu-table.panemu.com/usages/persist-states
   */
  saveState?: {key: string, states?: (keyof Omit<TableState, 'structureKey'>)[]} | null

  errorHandler: (error: any) => void;
}