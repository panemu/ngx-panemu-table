import { Dialog, DialogRef } from '@angular/cdk/dialog';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { Overlay } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ColumnType } from '../column/column';
import { PanemuTableController } from '../panemu-table-controller';
import { StickySelectorComponent } from './sticky-selector.component';
import { PanemuTableService } from '../panemu-table.service';

@Component({
  templateUrl: 'setting-dialog.component.html',
  standalone: true,
  imports: [FormsModule, CommonModule, DragDropModule, StickySelectorComponent]
})

export class SettingDialogComponent implements OnInit {
  controller!: PanemuTableController<any>;
  dialogRef = inject<DialogRef<string>>(DialogRef<string>);
  pts = inject(PanemuTableService)
  labelTranslation = this.pts.getLabelTranslation()
  GROUP_COLUMN = ColumnType.GROUP;
  constructor() { }

  ngOnInit() { }

  static show(dialog: Dialog, overlay: Overlay, controller: PanemuTableController<any>) {
    let ref = dialog.open(SettingDialogComponent, {
      positionStrategy: overlay.position().global().right(),
      minWidth: 300,
      panelClass: 'panemu-setting',
    })
    ref.componentInstance!.controller = controller;
    return ref;
  }

  repaint() {
    this.controller.relayout();
    this.controller.saveState();
  }

  drop(event: CdkDragDrop<string[]>, parent: any[]) {
    moveItemInArray(parent, event.previousIndex, event.currentIndex);
    this.repaint();
  }

  reset() {
    this.controller.deleteState();
  }

  close() {
    this.dialogRef?.close();
  }
}