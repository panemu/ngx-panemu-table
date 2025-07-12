import { Component, Input, OnInit, WritableSignal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { BaseColumn, FilterEditor, TableCriteria } from 'ngx-panemu-table';

@Component({
    imports: [MatSlideToggle, ReactiveFormsModule],
    templateUrl: './boolean-filter.component.html'
})
export class BooleanFilterComponent implements OnInit, FilterEditor {
  column!: BaseColumn<any>;
  filter!: TableCriteria;
  value!: WritableSignal<string | null | undefined>;

  txt = new FormControl('');

  ngOnInit(): void {
    this.txt.valueChanges.subscribe({
      next: val => {
        console.log(`slide ${val} `, typeof val);
        this.value.set(val)
      }
    })
    this.txt.setValue(this.filter.value || false)
  }
}
