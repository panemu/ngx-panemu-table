import { CommonModule } from '@angular/common';
import { Component, OnInit, Signal, TemplateRef } from '@angular/core';
import { PropertyColumn } from '../column/column';
import { CellComponent, CellRenderer } from './cell';
import { GenericCellPipe } from './generic-cell.pipe';

@Component({
  templateUrl: 'default-cell-renderer.html',
  standalone: true,
  imports: [CommonModule, GenericCellPipe]
})
export class DefaultCellRenderer implements CellComponent<any>, OnInit {
  row!: any;
  column!: PropertyColumn<any>
  templateRef?: Signal<TemplateRef<any>>;
  parameter?: any;
  
  ngOnInit(): void {
    this.templateRef = this.parameter?.templateRef
  }
  
  static create(templateRef?: Signal<TemplateRef<any> | undefined>): CellRenderer {
    return {
      component: DefaultCellRenderer,
      parameter: {templateRef}
    }
  }
}