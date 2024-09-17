import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { GroupCellPipe, RowGroup, RowGroupComponent } from 'ngx-panemu-table';

@Component({
  templateUrl: 'country-row-group.component.html',
  standalone: true,
  imports: [CommonModule, GroupCellPipe],
  styles: `
  :host {
    display: contents;
  }
  `
})

export class CountryRowGroup implements OnInit, RowGroupComponent {
  @Input() colSpan!: number;
  @Input() rowGroup!: RowGroup;
  @Input() expandAction!: (group: RowGroup) => void;
  @Input() parameter?: any;
  constructor() { }

  ngOnInit() { }
}