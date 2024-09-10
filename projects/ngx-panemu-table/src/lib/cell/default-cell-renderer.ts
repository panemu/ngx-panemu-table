import { CommonModule } from '@angular/common';
import { Component, OnInit, Signal, TemplateRef, Type } from '@angular/core';
import { Expansion, PropertyColumn } from '../column/column';
import { CellComponent, CellRenderer } from './cell';
import { GenericCellPipe } from './generic-cell.pipe';
import { ExpansionRowRenderer } from '../row/expansion-row';
import { ExpansionCellRenderer } from './expansion-cell-renderer';

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