import { Component, effect, ElementRef, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LeafColumn, TickColumn } from '../column/column';
import { HeaderComponent } from './header';
import { Subscription } from 'rxjs';

@Component({
  template: `
   <div class="tick-header">
      <input #checkbox type="checkbox" [indeterminate]="partialChecked()" (change)="toggle($event)"><span class="label"> {{column.label}} </span>
   </div>`,
  imports: [FormsModule],
  styles: `
   .tick-header {
      display: flex; align-items: center;
   }
   .tick-header .label {
      margin-left: 4px;
   }
   `
})
export class TickHeaderRenderer implements HeaderComponent {
  _column!: LeafColumn<any>
  checkbox = viewChild<ElementRef<HTMLInputElement>>('checkbox');
  partialChecked = signal(false)
  allChecked = false;
  subscription$?: Subscription;

  constructor() {
    effect(() => {
      const controller = this.tickColumn.controller;
      const selectedCount = controller['__selections']?.().length;
      this.allChecked = controller.isAllSelected();
      this.partialChecked.set(selectedCount > 0 && !this.allChecked);
      if (this.checkbox()) {
        this.checkbox()!.nativeElement.checked = this.allChecked;
      }
    })
  }

  toggle(evt: any) {
    this.tickColumn.controller.setTickedAll?.(evt.target.checked)
  }

  set column(clm: LeafColumn<any>) {
    this._column = clm;
    this.subscription$?.unsubscribe();

    if (!this._column || !this._column.getTableController) {
      console.error('TickHeaderRenderer in a bad state')
      return;
    }

    this.subscription$ = new Subscription();
    this.subscription$.add(
      this._column.getTableController().afterReloadEvent.subscribe({
        next: (data) => {
          this.tickColumn.controller.setTickedAll(false);
          this.tickColumn.controller['__data'].set(this._column.getTableController!().getData())
        },
      }),
    );
  }

  get column() {
    return this._column;
  }

  private get tickColumn() {
    return this._column as TickColumn<any>
  }

  ngOnDestroy(): void {
    this.subscription$?.unsubscribe();
  }
}