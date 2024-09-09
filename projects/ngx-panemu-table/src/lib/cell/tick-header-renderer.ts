import { Component, effect } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TickColumnClass } from '../column/tick-column-class';
import { PropertyColumn } from '../column/column';
import { HeaderComponent } from './header';

@Component({
   template: `
   <div class="tick-header">
      <input type="checkbox" [indeterminate]="partialChecked" [checked]="allChecked" (change)="toggle($event)"><span class="label"> {{column.label}}</span>
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

export class TickHeaderRenderer implements HeaderComponent<any> {
   column!: PropertyColumn<any>
   partialChecked = false
   allChecked = false;
   constructor() {
      effect(() => {
         const asTickColumn = this.column as TickColumnClass<any>;
         const selectedCount = asTickColumn.selections?.().length;
         this.allChecked = !!selectedCount && selectedCount == asTickColumn?.__data().length
         this.partialChecked = selectedCount > 0 && !this.allChecked;
      })
   }

   toggle(evt: any) {
      (this.column as TickColumnClass<any>).setTickedAll?.(evt.target.checked)
   }
}