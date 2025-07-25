import { Component, Input, OnInit, signal, Signal, TemplateRef, Type } from '@angular/core';
import { CellComponent } from './cell';
import { PropertyColumn } from '../column/column';
import { CellFormatterPipe } from './cell-formatter.pipe';
import { ExpansionRowRenderer } from '../row/expansion-row';
import { NgClass } from '@angular/common';

@Component({
    template: `
   <div class="detail-cell {{position}}">
     <button (click)="click()" [disabled]="disabled" class="">
        <span class="ngx-panemu-table-icon" [ngClass]="expanded() ? 'icon-expand_more' : 'icon-chevron_right'"></span>
     </button>
      <span>{{row[column.field] | cellFormatter:row:column:column.formatter}}</span>
   </div>
   `,
    imports: [CellFormatterPipe, NgClass]
})

export class ExpansionCellRenderer implements OnInit, CellComponent<any> {
  row!: any;
  column!: PropertyColumn<any>;

  parameter?: { 
    component: Signal<TemplateRef<any> | undefined> | Type<ExpansionRowRenderer<any>>, 
    isDisabled?: (row: any) => boolean ,
    buttonPosition?: 'start' | 'end'
  };
  
  disabled = false;
  expanded = signal(false);
  position = '';

  ngOnInit() {
    this.disabled = this.parameter!.isDisabled?.(this.row) ?? false;
    this.position = this.parameter?.buttonPosition ?? ''
  }

  click() {
    this.column.__expandHook?.(this.row, this.parameter!.component, this.column, this.expanded);
  }
}