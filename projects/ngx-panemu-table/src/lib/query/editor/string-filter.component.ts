import { Component, effect, Input, OnInit, WritableSignal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { PropertyColumn } from '../../column/column';
import { FilterEditor } from './filter-editor';
import { TableCriteria } from '../../table-query';

@Component({
  selector: 'string-filter',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './string-filter.component.html',
})
export class StringFilterComponent implements OnInit, FilterEditor {
  @Input() column!: PropertyColumn<any>;
  @Input() filter!: TableCriteria;
  @Input() value!: WritableSignal<string|undefined|null>
  
  txt = new FormControl('');
  constructor() {
    effect(() => {
      this.txt.setValue(this.value() ?? null)
    })
  }
  ngOnInit(): void {
    this.txt.valueChanges.subscribe({next: val => this.value.set(val)})
    this.txt.setValue(this.filter.value)
  }

  
}
