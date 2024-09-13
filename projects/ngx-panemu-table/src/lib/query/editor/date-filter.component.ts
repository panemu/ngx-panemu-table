import { Component, Input, OnInit, WritableSignal } from '@angular/core';
import { FilterEditor } from './filter-editor';
import { PropertyColumn } from '../../column/column';
import { Filter } from '../filter';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { formatDateToIso } from '../../util';
import { TableCriteria } from '../../table-query';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './date-filter.component.html',
})
export class DateFilterComponent implements OnInit, FilterEditor {

  @Input({ required: true }) column!: PropertyColumn<any>;
  @Input({ required: true }) filter!: TableCriteria;
  @Input({ required: true }) value!: WritableSignal<string|undefined|null>
  
  txt = new FormControl('');
  
  ngOnInit(): void {
    this.txt.valueChanges.subscribe({next: val => this.value.set(val)})
    this.txt.setValue(this.filter.value)
  }

  today(offset: number) {
    const td = new Date
    td.setDate(td.getDate() + offset);
    this.txt.setValue(formatDateToIso(td) || '')
  }
}
