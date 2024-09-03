import { Component } from '@angular/core';
import { PropertyColumn } from '../column/column';
import { HeaderComponent, HeaderRenderer } from './header';

@Component({
  template: '{{column.label}}',
})
export class DefaultHeaderRenderer implements HeaderComponent<any> {
  row!: any;
  rowIndex!: number;
  column!: PropertyColumn<any>

  static create(): HeaderRenderer {
    return {
      component: DefaultHeaderRenderer
    }
  }
}