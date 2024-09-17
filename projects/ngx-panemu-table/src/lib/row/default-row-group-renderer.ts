import { CommonModule } from '@angular/common';
import { Component, Input, isSignal, OnInit, Signal, TemplateRef, Type, viewChild } from '@angular/core';
import { SpinningIconComponent } from '../busy-indicator/spinning-icon.component';
import { GroupCellPipe } from '../cell/group-cell.pipe';
import { PanemuPaginationComponent } from '../pagination/panemu-pagination.component';
import { RowGroup } from './row-group';

export interface RowGroupComponent {
  colSpan: number
  rowGroup: RowGroup
  expandAction: (group: RowGroup) => void;
  contentRenderer?: Type<any> | Signal<TemplateRef<any> | undefined>
}

export interface RowGroupRenderer {
  component: Type<RowGroupComponent>,
  parameter?: any;
}

@Component({
  templateUrl: 'default-row-group-renderer.html',
  standalone: true,
  imports: [CommonModule, GroupCellPipe, SpinningIconComponent, PanemuPaginationComponent],
  styles: `
  :host {
    display: contents;
  }
  `
})
export class DefaultRowGroupRenderer implements OnInit, RowGroupComponent {
  @Input() colSpan!: number;
  @Input() rowGroup!: RowGroup;
  @Input() expandAction!: (group: RowGroup) => void;
  @Input() parameter?: any;
  contentComponent?: Type<any>
  showPagination = true;
  contentTemplate = viewChild<TemplateRef<any>>('defaultContent');

  ngOnInit(): void {
    this.showPagination = this.parameter?.showPagination ?? true;
    if (this.parameter?.contentRenderer) {
      if (isSignal(this.parameter?.contentRenderer)) {
        this.contentTemplate = this.parameter.contentRenderer;
      } else {
        this.contentComponent = this.parameter?.contentRenderer;
      }
    }
    
  }

  static create(parameter: {contentRenderer?: Type<any> | Signal<TemplateRef<any> | undefined>, showPagination?: boolean}): RowGroupRenderer {
    return {
      component: DefaultRowGroupRenderer,
      parameter: parameter
    }
  }
}