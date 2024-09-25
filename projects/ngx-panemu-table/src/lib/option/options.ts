import { Signal, TemplateRef, Type } from "@angular/core";
import { TableFooterComponent } from "../table-footer";
import { PropertyColumn } from "../column/column";

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

  rowRenderer?: Signal<TemplateRef<RowRenderer<T>> | undefined>
}

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
   * Table footer component/template
   */
  footer?: {
    /**
     * Template or component for the footer. It should contains one or more td or th elements.
     * If it is a component, the host css display property must be set to `contents`. 
     */
    component: Type<TableFooterComponent> | Signal<TemplateRef<any> | undefined>
    parameter?: any
  } | null,

  /**
   * Options related to table row.
   */
  rowOptions: RowOptions<T>
}