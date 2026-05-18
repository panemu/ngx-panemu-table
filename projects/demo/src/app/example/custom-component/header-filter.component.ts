
import { Component, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { AndPredicate, HeaderComponent, HeaderRenderer, PanemuTableController, PropertyColumn } from 'ngx-panemu-table';
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
      let criteria: AndPredicate = this.controller.criteria as AndPredicate;
      if (!criteria) {
        criteria = {type: 'and', operands: []}
        this.controller.criteria = criteria;
      }
      let operand = criteria.operands.find((item: any) => item['field'] === this.column.field);
      if (val) {

        if (!operand) {
          criteria.operands.push({type: 'eq', field: String(this.column.field), value: val})
        } else {
          (operand as any).value = val;
        }
      } else {
        if (operand) {
          criteria.operands = criteria.operands.filter(item => item !== operand);
        }
      }
      this.controller.reloadData();
    })
  }

  static create(controller: PanemuTableController<any>): HeaderRenderer {
    return {component: HeaderFilterComponent, parameter: {controller}}
  }

}