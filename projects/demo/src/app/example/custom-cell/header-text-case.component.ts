import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { HeaderComponent, PropertyColumn } from 'ngx-panemu-table';

type TextCase = 'normal' | 'upper' | 'lower'

@Component({
    templateUrl: 'header-text-case.component.html',
    imports: [CommonModule, ReactiveFormsModule]
})
export class HeaderTextCaseComponent implements OnInit, HeaderComponent {
  column!: PropertyColumn<any>;
  rdbCase = new FormControl('upper' as TextCase)
  constructor() { }
  parameter?: any;

  ngOnInit() {
    this.rdbCase.valueChanges.subscribe({
      next: val => this.changeCase(val)
    })
    this.changeCase(this.rdbCase.value)
  }

  changeCase(textCase: TextCase | null) {
    if (!textCase) return;

    if (textCase == 'upper') {
      this.column.formatter = (val: string) => val?.toUpperCase()
    } else if (textCase == 'lower') {
      this.column.formatter = (val: string) => val?.toLowerCase()
    } else if (textCase == 'normal') {
      this.column.formatter = (val: string) => val
    }

  }
}