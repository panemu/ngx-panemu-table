import { NgIf } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { RowGroup, RowGroupContentComponent } from 'ngx-panemu-table';

@Component({
  template: `
  <div class="flex items-center">
    @if (rowGroup.data.value == 'true') {
      <span class="material-symbols-outlined text-2xl text-green-600">
        {{rowGroup.data.value == 'true' ? 'check_circle' : 'help_outline'}}
      </span> <span class="text-green-600">Verified</span>
    } @else {
      <span class="material-symbols-outlined text-2xl text-yellow-600">
        {{rowGroup.data.value == 'true' ? 'check_circle' : 'help_outline'}}
      </span>
      <span class="text-yellow-600">Unverified</span>
    }
  </div>
  `,
  standalone: true,
  imports: [NgIf]
})
export class BooleanRowGroupContentComponent implements RowGroupContentComponent {
  rowGroup!: RowGroup;
}