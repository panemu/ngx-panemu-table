
import { Component } from '@angular/core';
import { RowGroup, RowGroupContentComponent } from 'ngx-panemu-table';

@Component({
    template: `
  <div class="flex items-center">
    @if (rowGroup.data.value) {
      <span class="material-symbols-outlined text-2xl text-green-600">check_circle</span>
      <span class="text-green-600">Verified</span>
    } @else {
      <span class="material-symbols-outlined text-2xl text-yellow-600">help_outline</span>
      <span class="text-yellow-600">Unverified</span>
    }
  </div>
  `,
})
export class BooleanRowGroupContentComponent implements RowGroupContentComponent {
  rowGroup!: RowGroup;
}
