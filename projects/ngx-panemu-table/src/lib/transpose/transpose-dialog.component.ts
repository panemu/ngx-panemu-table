import { Dialog, DialogRef } from '@angular/cdk/dialog';
import { Overlay } from '@angular/cdk/overlay';
import { Component, inject, OnInit, Signal } from '@angular/core';
import { PropertyColumn } from '../column/column';
import { PanemuTableService } from '../panemu-table.service';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounce, debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'pnm-transpose-dialog',
  templateUrl: 'transpose-dialog.component.html',
  standalone: true,
  imports: [ReactiveFormsModule]
})

export class TransposeDialogComponent implements OnInit {
  columns!: PropertyColumn<any>[];
  data!: Signal<any>;
  dialogRef = inject<DialogRef<any>>(DialogRef<any>);
  pts = inject(PanemuTableService)
  labelTranslation = this.pts.getLabelTranslation()
  txtSearch = new FormControl('')
  filteredColumns!: PropertyColumn<any>[];
  constructor() { }

  ngOnInit() {
    this.filteredColumns = [...this.columns]
    this.txtSearch.valueChanges.pipe(
      debounceTime(250),
      distinctUntilChanged(),
    ).subscribe(val => {
      console.log('filtering...')
      val = val?.trim().toLowerCase() || ''

      if (val) {
        this.filteredColumns = [];
        this.columns.forEach(clm => {
          if (clm.label?.toLowerCase().includes(val)) {
            this.filteredColumns.push(clm)
          } else {
            let dataValue = clm.formatter?.(this.data()?.[clm.field], this.data(), clm) || this.data()?.[clm.field];
            if (typeof dataValue === 'string') {
              if (dataValue.toLowerCase().includes(val)) {
                this.filteredColumns.push(clm)
              }
            }
          }
        })
      } else {
        this.filteredColumns = [...this.columns]
      }
    })
  }

  static show(dialog: Dialog, overlay: Overlay, columns: PropertyColumn<any>[], data: Signal<any>) {
    let ref = dialog.open(TransposeDialogComponent, {
      positionStrategy: overlay.position().global().right(),
      minWidth: 300,
      maxWidth: '50vw',
      panelClass: 'panemu-setting',
      hasBackdrop: false
    })
    ref.componentInstance!.columns = columns.filter(item => item.visible);
    ref.componentInstance!.data = data;
  }

  close() {
    this.dialogRef?.close();
  }
}