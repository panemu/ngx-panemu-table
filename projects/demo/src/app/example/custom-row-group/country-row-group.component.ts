import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { GroupCellPipe, PanemuPaginationComponent, RowGroup, RowGroupComponent } from 'ngx-panemu-table';

@Component({
  templateUrl: 'country-row-group.component.html',
  standalone: true,
  imports: [CommonModule, GroupCellPipe, PanemuPaginationComponent],
  styles: `
  :host {
    display: contents;
  }
  `
})

export class CountryRowGroup implements OnInit, RowGroupComponent {
  colSpan!: number;
  rowGroup!: RowGroup;
  expandAction!: (group: RowGroup) => void;
  parameter?: any;
  
  disableInteraction = false;


  constructor() { }

  ngOnInit() {
    this.disableInteraction = this.parameter?.alwaysExpanded ?? false;
  }
}