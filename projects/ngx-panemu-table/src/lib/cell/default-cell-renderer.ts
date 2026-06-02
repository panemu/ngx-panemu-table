import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, Signal, TemplateRef, viewChild } from '@angular/core';
import { LeafColumn } from '../column/column';
import { CellComponent, CellRenderer } from './cell';
import { CellFormatterPipe } from './cell-formatter.pipe';

@Component({
    templateUrl: 'default-cell-renderer.html',
    imports: [CommonModule, CellFormatterPipe]
})
export class DefaultCellRenderer implements CellComponent<any>, OnInit {
  @Input()
  row!: any;
  @Input()
  column!: LeafColumn<any>
  @Input()
  parameter?: any;
  templateRef = viewChild.required<TemplateRef<any>>('defaultDescriptionTemplate');

  ngOnInit(): void {
    this.templateRef = this.parameter?.templateRef ?? this.templateRef
  }

  /**
   * Create a custom cell renderer using `ng-template`.
   * @param templateRef
   * @returns
   */
  static create(templateRef?: Signal<TemplateRef<any> | undefined>): CellRenderer {
    return {
      component: DefaultCellRenderer,
      parameter: {templateRef}
    }
  }

}
