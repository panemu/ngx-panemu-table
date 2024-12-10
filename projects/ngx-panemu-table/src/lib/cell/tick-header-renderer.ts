import { Component, effect, ElementRef, Input, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TickColumnClass } from '../column/tick-column-class';
import { PropertyColumn } from '../column/column';
import { HeaderComponent } from './header';
import { isDataRow } from '../util';

@Component({
   template: `
   <div class="tick-header">
      <input #checkbox type="checkbox" [indeterminate]="partialChecked" (change)="toggle($event)"><span class="label"> {{column.label}} </span>
   </div>`,
   imports: [FormsModule],
   standalone: true,
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
   column!: PropertyColumn<any>
   checkbox = viewChild<ElementRef<HTMLInputElement>>('checkbox');
   partialChecked = false
   allChecked = false;
   constructor() {
      effect(() => {
         const asTickColumn = this.column as TickColumnClass<any>;
         const selectedCount = asTickColumn.selections?.().length;
         this.allChecked = !!selectedCount && selectedCount == asTickColumn?.__data().filter(item => isDataRow(item)).length;
         this.partialChecked = selectedCount > 0 && !this.allChecked;
         if (this.checkbox()) {
            this.checkbox()!.nativeElement.checked = this.allChecked;
         }
      })
   }

   toggle(evt: any) {
      (this.column as TickColumnClass<any>).setTickedAll?.(evt.target.checked)
   }
}