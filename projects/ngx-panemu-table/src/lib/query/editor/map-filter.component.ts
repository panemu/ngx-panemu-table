import { CommonModule } from '@angular/common';
import { Component, Input, isSignal, OnChanges, OnInit, SimpleChanges, WritableSignal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MapColumn } from '../../column/column';
import { FilterEditor } from './filter-editor';
import { TableCriteria } from '../../table-query';

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './map-filter.component.html',
})
export class MapFilterComponent implements OnInit, FilterEditor, OnChanges {
  
  column!: MapColumn<any>;
  filter!: TableCriteria;
  value!: WritableSignal<string|undefined|null>;
  
  cmb = new FormControl('');
  options: string[][] = [];

  ngOnInit(): void {
    this.options = [];
    const valueMap = isSignal(this.column.valueMap) ? this.column.valueMap() : this.column.valueMap;
    Object.entries(valueMap!).forEach( ([key, value]) => this.options.push([key, value]))
    this.cmb.valueChanges.subscribe({next:val => this.value.set(val)})
    this.cmb.setValue(this.filter.value);
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.ngOnInit()
  }

  getValue() { return this.cmb.value} 
}
