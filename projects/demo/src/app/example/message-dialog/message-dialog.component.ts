import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MessageDialogObject } from './message-dialog.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'cmp-message-dialog',
  templateUrl: './message-dialog.component.html',
  standalone: true,
  imports: [CommonModule, MatDialogModule],
  styleUrls: ['./message-dialog.component.scss']
})

export class MessageDialogComponent {
  titleClass = '';
  titleIcon = '';
  constructor(public dialogRef: MatDialogRef<MessageDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: MessageDialogObject) {
    if (data.type === 'info') {
      this.titleClass = 'mat-dialog-title bg-blue-700 text-white';
      this.titleIcon = 'icon-info-circled';
    } else if (data.type === 'confirm') {
      this.titleClass = 'mat-dialog-title bg-yellow-500 text-yellow-900';
      this.titleIcon = 'icon-attention';
    } else if (data.type === 'error') {
      this.titleClass = 'mat-dialog-title bg-red-700 text-white';
      this.titleIcon = 'icon-block';
    }

    if (data.noLabel || data.cancelLabel) {
      this.dialogRef.disableClose = true;
    }
  }
  close(answer: any) {
    this.dialogRef.close(answer);
  }
}