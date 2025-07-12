import { ChangeDetectorRef, Component, effect, OnInit } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PropertyColumn, TickColumn } from '../column/column';
import { TickColumnClass } from '../column/tick-column-class';
import { CellComponent } from './cell';

@Component({
    template: '<input type="checkbox" [formControl]="chkControl">',
    imports: [ReactiveFormsModule]
})

export class TickCellComponent implements CellComponent<any>, OnInit {
  row!: any;
  column!: PropertyColumn<any>
  disabled = false;
  chkControl = new FormControl(false);
  
  constructor(cdr: ChangeDetectorRef) {
    effect(() => {
      let ticked = (this.column as TickColumnClass<any>).getTickedRowsAsSignal()().includes(this.row);
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
    this.chkControl.valueChanges.subscribe(val => (this.column as TickColumnClass<any>).setTicked(val ?? false, this.row))
  }

}