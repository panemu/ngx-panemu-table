import { Component, Input, OnInit, WritableSignal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { PropertyColumn } from '../../column/column';
import { FilterEditor } from './filter-editor';
import { TableCriteria } from '../../table-query';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './string-filter.component.html',
})
export class StringFilterComponent implements OnInit, FilterEditor {
  @Input({ required: true }) column!: PropertyColumn<any>;
  @Input({ required: true }) filter!: TableCriteria;
  @Input({ required: true }) value!: WritableSignal<string|undefined|null>
  
  txt = new FormControl('');
  
  ngOnInit(): void {
    this.txt.valueChanges.subscribe({next: val => this.value.set(val)})
    this.txt.setValue(this.filter.value)
  }

  
}