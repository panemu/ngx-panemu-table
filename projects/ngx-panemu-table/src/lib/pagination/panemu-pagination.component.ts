import { CommonModule } from '@angular/common';
import { Component, effect, input, Input, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RowGroup } from '../row/row-group';
import { PanemuPaginationController } from './panemu-pagination-controller';

@Component({
  selector: 'panemu-pagination',
  templateUrl: 'panemu-pagination.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule],
})

export class PanemuPaginationComponent {
  controller = input.required<PanemuPaginationController>();
  @Input() group!: RowGroup;
  value = signal('');
  totalRows = signal(0);
  prevValue = '';
  constructor() {
    effect(() => {
      if (this.controller()) {
        this.controller().__refreshPagination = this.refresh.bind(this);
      }
    })
  }
  
  private refresh(start: number, maxRows: number, totalRows: number) {
    this.totalRows.set(totalRows);
    let end = Math.min(start + maxRows, totalRows)
    this.value.set((start + 1) + '-' + end);
    this.prevValue = this.value();
  }

  applyChange() {
    if (this.prevValue == this.value()) return;

    let parts: string[] = this.value().split('-');
    if (parts.length != 2) {
      this.value.set(this.prevValue);
      return;
    }

    let start = Number(parts[0]);
    let end = Number(parts[1]);

    if (isNaN(start) || isNaN(end) || start > end || start < 1) {
      this.value.set(this.prevValue);
      return;
    }

    this.controller().startIndex = start - 1;
    this.controller().maxRows = end + 1 - start;
    if (this.group) {
      this.controller().__reloadGroup(this.group)
    } else {
      this.controller().reloadCurrentPage();
    }

  }

  prev() {
    let start = this.controller().startIndex - this.controller().maxRows;
    if (this.controller().startIndex == 0) {
      let modulus = this.totalRows() % this.controller().maxRows;
      start = modulus == 0 ? Math.trunc(this.totalRows() / this.controller().maxRows) - 1 : Math.trunc(this.totalRows() / this.controller().maxRows);
      start = start * this.controller().maxRows;
    } else if (start < 0) {
      start = 0;
    }
    this.value.set((start + 1) + '-' + (start + this.controller().maxRows));

    this.applyChange();
  }

  next() {
    let start = this.controller().startIndex + this.controller().maxRows;
    if (start >= this.totalRows()) {
      start = 0;
    }
    this.value.set((start + 1) + '-' + (start + this.controller().maxRows));

    this.applyChange();
  }
}