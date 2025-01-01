import { Component, input, OnInit, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { PanemuTableController } from 'ngx-panemu-table';

const DEFAULT_MAX_ROWS = 100;

@Component({
  selector: 'custom-pagination',
  imports: [ReactiveFormsModule],
  standalone: true,
  templateUrl: 'custom-pagination.component.html',
  styleUrl: 'custom-pagination.component.scss'
})

export class CustomPaginationComponent implements OnInit {
  maxRowOptions = [10, 20, 50, 100];
  cmbMaxRow = new FormControl(DEFAULT_MAX_ROWS);
  txtGoto = new FormControl(1);
  isFirstPage = signal(true);
  isLastPage = signal(false);
  pageIndex = signal(0);
  totalPages = signal(0);
  controller = input<PanemuTableController<any>>();
  totalRows = signal(0);
  onFocusGotoPage = 0;
  constructor() {

    this.cmbMaxRow.valueChanges.subscribe((val) => {
      console.log(val)
      this.applyChange();
    });

  }

  ngOnInit() {
    this.controller()?.initPaginationComponent(this.refresh.bind(this));
  }

  private refresh(start: number, maxRows: number, totalRows: number) {
    this.isFirstPage.set(start == 0);
    this.isLastPage.set(start + maxRows >= totalRows);
    this.pageIndex.set(Math.floor(start / maxRows));
    this.totalPages.set(Math.ceil(totalRows / maxRows));
    this.cmbMaxRow.setValue(maxRows, { emitEvent: false });
    this.totalRows.set(totalRows);
  }

  first() {
    this.pageIndex.set(0);
    this.applyChange();
  }

  previous() {
    if (this.pageIndex() > 0) {
      this.pageIndex.set(this.pageIndex() - 1);
      this.applyChange();
    }
  }

  last() {
    this.pageIndex.set(this.totalPages() - 1);
    this.applyChange();
  }

  next() {
    if (this.pageIndex() + 1 < this.totalPages()) {
      this.pageIndex.set(this.pageIndex() + 1);
      this.applyChange();
    }
  }

  private applyChange() {
    let maxRows = (this.cmbMaxRow.value ?? DEFAULT_MAX_ROWS);
    let start = this.pageIndex() * maxRows;
    this.controller()!.startIndex = start;
    this.controller()!.maxRows = maxRows;
    this.controller()?.reloadCurrentPage();
  }

  goToPage() {
    let gotoPage = Number(this.txtGoto.value);

    this.pageIndex.set(gotoPage - 1);
    this.applyChange();

  }

  onGotoBlur() {
    let gotoPage = Number(this.txtGoto.value);
    
    if (gotoPage == this.onFocusGotoPage) {
      return;
    }
    this.goToPage();
  }

  onGotoFocus() {
    this.onFocusGotoPage = this.txtGoto.value || 1;
  }
}