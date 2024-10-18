import { CommonModule } from '@angular/common';
import { Component, Input, isSignal, OnInit, Signal, TemplateRef, Type, viewChild } from '@angular/core';
import { SpinningIconComponent } from '../busy-indicator/spinning-icon.component';
import { GroupCellPipe } from '../cell/group-cell.pipe';
import { PanemuPaginationComponent } from '../pagination/panemu-pagination.component';
import { RowGroup } from './row-group';
import { RowGroupContentRendererDirective } from './row-group-content-renderer.directive';

/**
 * A RowGroup has 3 parts, the button to expand/collapse, the content, and the pagination.
 * Angular component for the content should implement this interface.
 */
export interface RowGroupContentComponent {
  /**
   * RowGroup object. To get the data call `RowGroup.data`.
   */
  rowGroup: RowGroup;
}

/**
 * The default component that renders RowGroup is `DefaultRowGroupRenderer`.
 * If you want to only customize the content part and keep the expand button as is, consider using
 * `DefaultRowGroupRenderer.create` static method. It also has a flag to hide the pagination.
 * 
 * To create a custom renderer, create a component extending this interface.
 * The template should be one or more td elements. The host css display property must be set to `contents`.
 * 
 * ```css
 *:host {
    display: contents;
  }
 * ```
 */
export interface RowGroupComponent {
  /**
   * It stores the number of visible columns that can be used to span the td element horizontally.
   */
  colSpan: number

  /**
   * This is the RowGroup object. Access the `RowGroup.data` property to get the data provided by 
   * the table datasource.
   */
  rowGroup: RowGroup

  /**
   * This is a callback to propagate user click
   * to `PanemuTableComponent` that will expand the row and eventually trigger the datasource 
   * to get the row group children data.
   */
  expandAction: (group: RowGroup, usePagination?: boolean) => void;
  parameter?: any;
}

/**
 * The template should be one or more td elements. The host css display property must be set to `contents`.
 */
export interface RowGroupFooterComponent {
  /**
   * This is the RowGroup object. Access the `RowGroup.data` property to get the data provided by 
   * the table datasource.
   */
  rowGroup: RowGroup

  /**
  * It stores the number of visible columns that can be used to span the td element horizontally.
  */
  colSpan: number

  parameter?: any
}

/**
 * Interface for `PropertyColumn.rowGroupRenderer`. It gives a way to customize RowGroup component.
 * If you want to only customize the content part and keep the expand button as is, consider using
 * `DefaultRowGroupRenderer.create` static method. It also has a flag to hide the pagination.
 */
export interface RowGroupRenderer {
  /**
   * Component implements `RowGroupComponent`
   */
  component: Type<RowGroupComponent>,
  footerComponent?: Type<RowGroupFooterComponent> | Signal<TemplateRef<any> | undefined>,
  parameter?: any;
}

@Component({
  templateUrl: 'default-row-group-renderer.html',
  standalone: true,
  imports: [CommonModule, GroupCellPipe, SpinningIconComponent, PanemuPaginationComponent, RowGroupContentRendererDirective],
  styles: `
  :host {
    display: contents;
  }
  `
})
export class DefaultRowGroupRenderer implements OnInit, RowGroupComponent {
  colSpan!: number;
  rowGroup!: RowGroup;
  expandAction!: (group: RowGroup, usePagination?: boolean) => void;
  parameter?: any;
  contentComponent?: Type<RowGroupContentComponent>
  showPagination?: boolean;
  contentTemplate = viewChild<TemplateRef<any>>('defaultContent');

  ngOnInit(): void {
    this.showPagination = this.parameter?.showPagination;
    if (this.parameter?.contentRenderer) {
      if (isSignal(this.parameter?.contentRenderer)) {
        this.contentTemplate = this.parameter.contentRenderer;
      } else {
        this.contentComponent = this.parameter?.contentRenderer;
      }
    }

  }

  /**
   * Customize DefaultRowGroupRenderer. Provided customization is
   * - show/hide pagination. If undefined, it will adapt to the table whether the table use pagination or not.
   * - content component
   * - footer component
   * @param parameter
   * @returns 
   */
  static create(customization: {
    header?: { contentRenderer?: Type<RowGroupContentComponent> | Signal<TemplateRef<any> | undefined>, showPagination?: boolean },
    footerComponent?: Type<RowGroupFooterComponent> | Signal<TemplateRef<any> | undefined>,
    parameter?: any
  }): RowGroupRenderer {

    let params = customization.parameter || {};
    Object.assign(params, customization.header)

    return {
      component: DefaultRowGroupRenderer,
      footerComponent: customization.footerComponent,
      parameter: params
    }
  }
}