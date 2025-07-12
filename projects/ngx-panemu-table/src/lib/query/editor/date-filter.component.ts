import { Component, inject, Input, OnInit, WritableSignal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { PropertyColumn } from '../../column/column';
import { TableCriteria } from '../../table-query';
import { formatDateToIso } from '../../util';
import { FilterEditor } from './filter-editor';
import { PanemuTableService } from '../../panemu-table.service';

@Component({
    imports: [ReactiveFormsModule],
    templateUrl: './date-filter.component.html'
})
export class DateFilterComponent implements OnInit, FilterEditor {

  column!: PropertyColumn<any>;
  filter!: TableCriteria;
  value!: WritableSignal<string|undefined|null>
  pts = inject(PanemuTableService)
  labelTranslation = this.pts.getLabelTranslation()
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
