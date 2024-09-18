import { ChangeDetectorRef, Component, effect, inject, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PropertyColumn, TickColumn } from '../column/column';
import { TickColumnClass } from '../column/tick-column-class';
import { CellComponent } from './cell';

@Component({
  template: '<input type="checkbox" [(ngModel)]="ticked" (change)="onTick()" [disabled]="disabled">',
  imports: [FormsModule],
  standalone: true
})

export class TickCellComponent implements CellComponent<any>, OnInit {
  row!: any;
  column!: PropertyColumn<any>
  disabled = false;

  ticked = false
  
  constructor(cdr: ChangeDetectorRef) {
    effect(() => {
      this.ticked = (this.column as TickColumnClass<any>).getTickedRowsAsSignal()().includes(this.row);
      cdr.markForCheck();
    })
  }

  ngOnInit(): void {
    this.disabled = (this.column as unknown as TickColumn<any>).isDisabled?.(this.row) ?? false;
  }


  onTick() {
    (this.column as TickColumnClass<any>).setTicked(this.ticked, this.row);
  }
}