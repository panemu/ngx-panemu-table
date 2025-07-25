import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { GroupCellPipe, PanemuPaginationComponent, RowGroup, RowGroupFooterComponent } from 'ngx-panemu-table';

@Component({
    templateUrl: 'country-row-group-footer.component.html',
    imports: [CommonModule, GroupCellPipe],
    styles: `
  :host {
    display: contents;
  }
  `
})

export class CountryRowGroupFooter implements RowGroupFooterComponent {
  rowGroup!: RowGroup;
  colSpan!: number;
  parameter?: any;
}