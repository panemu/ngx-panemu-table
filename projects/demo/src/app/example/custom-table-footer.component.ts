import { Component, OnInit } from '@angular/core';
import { TableFooterComponent } from 'ngx-panemu-table';

@Component({
  templateUrl: 'custom-table-footer.component.html',
  standalone: true,
  styles: `
  :host {
    display: contents
  }
  `
})

export class CustomTableFooter  {
  colSpan!: number;
  parameter?: any;

  toTemplate() {
    this.parameter.click?.();
  }
}