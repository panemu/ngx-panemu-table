import { Component, OnInit, signal, Signal, TemplateRef, Type } from '@angular/core';
import { CellComponent, CellRenderer } from './cell';
import { PropertyColumn } from '../column/column';
import { ExpansionRowRenderer } from '../row/expansion-row';
import { NgClass, NgComponentOutlet } from '@angular/common';

@Component({
  template: `
    <div class="detail-cell {{position}}">
      <button (click)="click()" [disabled]="disabled" class="">
        <span class="ngx-panemu-table-icon" [ngClass]="expanded() ? 'icon-expand_more' : 'icon-chevron_right'"></span>
      </button>
      <ng-container
        *ngComponentOutlet="parameter!.cellRenderer.component; inputs:{column, row, parameter: parameter!.cellRenderer.parameter}">
      </ng-container>
    </div>
   `,
  imports: [NgComponentOutlet, NgClass]
})

export class ExpansionCellRenderer implements OnInit, CellComponent<any> {
  row!: any;
  column!: PropertyColumn<any>;

  parameter?: {
    component: Signal<TemplateRef<any> | undefined> | Type<ExpansionRowRenderer<any>>,
    isDisabled?: (row: any) => boolean,
    buttonPosition?: 'start' | 'end'
    cellRenderer: CellRenderer
  };

  disabled = false;
  expanded = signal(false);
  position = '';

  ngOnInit() {
    this.disabled = this.parameter!.isDisabled?.(this.row) ?? false;
    this.position = this.parameter?.buttonPosition ?? '';
  }

  click() {
    this.column.__expandHook?.(this.row, this.parameter!.component, this.column, this.expanded);
  }
}