import { Component, effect, input, Input, model, OnChanges, signal, SimpleChanges } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RowGroup } from '../row/row-group';
import { PanemuPaginationController } from './panemu-pagination-controller';

@Component({
  selector: 'panemu-pagination',
  templateUrl: 'panemu-pagination.component.html',
  standalone: true,
  imports: [ReactiveFormsModule],
})

export class PanemuPaginationComponent implements OnChanges {
  @Input({required: true}) controller!: PanemuPaginationController;
  @Input() group!: RowGroup;
  txt = new FormControl('');
  totalRows = signal(0);
  prevValue = '';

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['controller'] && this.controller) {
      this.controller.initPaginationComponent(this.refresh.bind(this));
    }
  }
  
  private refresh(start: number, maxRows: number, totalRows: number) {
    this.totalRows.set(totalRows);
    let end = Math.min(start + maxRows, totalRows)
    this.txt.setValue((start + 1) + '-' + end);
    this.prevValue = this.txt.value || '';
  }

  applyChange() {
    if (this.prevValue == this.txt.value) return;

    let parts: string[] = this.txt.value?.split('-') || [];
    if (parts.length != 2) {
      this.txt.setValue(this.prevValue);
      return;
    }

    let start = Number(parts[0]);
    let end = Number(parts[1]);

    if (isNaN(start) || isNaN(end) || start > end || start < 1) {
      this.txt.setValue(this.prevValue);
      return;
    }

    this.controller.startIndex = start - 1;
    this.controller.maxRows = end + 1 - start;
    if (this.group) {
      this.controller.reloadGroup(this.group)
    } else {
      this.controller.reloadCurrentPage();
    }
    this.controller.saveState();
  }

  prev() {
    let start = this.controller.startIndex - this.controller.maxRows;
    if (this.controller.startIndex == 0) {
      let modulus = this.totalRows() % this.controller.maxRows;
      start = modulus == 0 ? Math.trunc(this.totalRows() / this.controller.maxRows) - 1 : Math.trunc(this.totalRows() / this.controller.maxRows);
      start = start * this.controller.maxRows;
    } else if (start < 0) {
      start = 0;
    }
    this.txt.setValue((start + 1) + '-' + (start + this.controller.maxRows));

    this.applyChange();
  }

  next() {
    let start = this.controller.startIndex + this.controller.maxRows;
    if (start >= this.totalRows()) {
      start = 0;
    }
    this.txt.setValue((start + 1) + '-' + (start + this.controller.maxRows));

    this.applyChange();
  }
}