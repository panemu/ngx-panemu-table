import { ChangeDetectorRef, Component, effect, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { LeafColumn, TickColumn } from '../column/column';
import { CellComponent } from './cell';

@Component({
    template: '<input type="checkbox" [formControl]="chkControl">',
    imports: [ReactiveFormsModule]
})

export class TickCellComponent implements CellComponent<any>, OnInit {
  row!: any;
  column!: LeafColumn<any>
  disabled = false;
  chkControl = new FormControl(false);
  
  constructor(cdr: ChangeDetectorRef) {
    effect(() => {
      let ticked = (this.column as TickColumn<any>).controller.tickedRowsSignal().includes(this.row);
      if (ticked !== this.chkControl.getRawValue()) {
        this.chkControl.setValue(ticked);
        cdr.markForCheck();
      }
    })
  }

  ngOnInit(): void {
    let disabled = (this.column as unknown as TickColumn<any>).isDisabled?.(this.row) ?? false;
    if (disabled) {
      this.chkControl.disable();
    }
    this.chkControl.valueChanges.subscribe(val => (this.column as TickColumn<any>).controller.setTicked(val ?? false, this.row))
  }

}