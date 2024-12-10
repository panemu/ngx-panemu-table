import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MessageDialogObject } from './message-dialog/message-dialog.model';
import { MessageDialogComponent } from './message-dialog/message-dialog.component';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DocumentationService {
  constructor(private dialog: MatDialog) { }

  public showDialogInfo(htmlContent: string): Promise<'yes' | 'no' | 'cancel'> {
    return this.showDialog({
      content: htmlContent,
      type: 'info',
      yesLabel: 'Ok',
    });
  }

  public showDialogError(htmlContent: string): Promise<'yes' | 'no' | 'cancel'> {
    return this.showDialog({
      content: htmlContent,
      type: 'error',
      yesLabel: 'Ok',
    });
  }

  public showDialogConfirm(htmlContent: string): Promise<'yes' | 'no' | 'cancel'> {
    return this.showDialog({
      content: htmlContent,
      type: 'confirm',
      yesLabel: 'Yes',
      noLabel: 'No'
    });
  }

  public showDialog(o: MessageDialogObject): Promise<'yes' | 'no' | 'cancel'> {
    if (!o.yesLabel) { o.yesLabel = 'Ok'; }
    if (!o.type) { o.type = 'info'; }
    if (!o.title) {
      if (o.type === 'info') {
        o.title = 'Info';
      } else if (o.type === 'error') {
        o.title = 'Error';
      } else if (o.type === 'confirm') {
        o.title = 'Confirm';
      }
    }

    const dialogRef = this.dialog.open(MessageDialogComponent, {
      data: o,
      position: { top: '50px' }
    });

    return firstValueFrom<'yes' | 'no' | 'cancel'>(dialogRef.afterClosed());
  }

}