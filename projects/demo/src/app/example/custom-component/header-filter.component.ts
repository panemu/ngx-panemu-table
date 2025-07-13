
import { Component, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { HeaderComponent, HeaderRenderer, PanemuTableController, PropertyColumn } from 'ngx-panemu-table';
import { debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
    templateUrl: 'header-filter.component.html',
    imports: [ReactiveFormsModule]
})
export class HeaderFilterComponent implements OnInit, HeaderComponent {
  column!: PropertyColumn<any>;
  parameter?: any;
  controller!: PanemuTableController<any>;
  txtFilter = new FormControl();
  ngOnInit() {
    this.controller = this.parameter.controller;
    this.txtFilter.valueChanges.pipe(
      debounceTime(250),
      distinctUntilChanged()
    ).subscribe(val => {
      let crit = this.controller.criteria.find(item => item.field === this.column.field);
      if (val) {
        if (!crit) {
          crit = {field: String(this.column.field), value: val}
          this.controller.criteria.push(crit)
        } else {
          crit.value = val
        }
      } else {
        if (crit) {
          this.controller.criteria = this.controller.criteria.filter(item => item.field != this.column.field)
        }
      }
      this.controller.reloadData();
    })
  }

  static create(controller: PanemuTableController<any>): HeaderRenderer {
    return {component: HeaderFilterComponent, parameter: {controller}}
  }

}