import { formatDate } from '@angular/common';
import { inject, Inject, Injectable, LOCALE_ID } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CellFormatter, DefaultColumnOptions, LabelTranslation, PanemuTableService, TableOptions } from 'ngx-panemu-table';
import { MessageDialogComponent } from '../example/message-dialog/message-dialog.component';
import { MessageDialogObject } from '../example/message-dialog/message-dialog.model';

@Injectable({providedIn: 'root'})
export class CustomPanemuTableService extends PanemuTableService {
  
  labelTranslation: LabelTranslation;
  dialog = inject(MatDialog)

  constructor(@Inject(LOCALE_ID) locale: string) { 
    super(locale)
    
    this.labelTranslation = super.getLabelTranslation();
    this.labelTranslation.searcForValueInColumn = 'Filter "{par0}" on column:';
    this.labelTranslation.validationError.required = 'Please specify value for this field.';
  }

  override getLabelTranslation()  {
    return this.labelTranslation;
  }

  override getDateCellFormatter(): CellFormatter {
    return (val) => {
      return formatDate(val, 'd MMM yyyy', this.locale) || ''
    }
  }

  override getColumnOptions(): Required<DefaultColumnOptions> {
    const options = super.getColumnOptions();
    options.sortable = false;
    return options;
  }

  override handleError(err: any): void {
    const msg = (typeof err == 'string') ? err : err?.message ?? JSON.stringify(err);
    const dialogData : MessageDialogObject = {
      content: msg,
      type:'error',
      yesLabel: 'Ok',
      title: 'Error'
    }
    const dialogRef = this.dialog.open(MessageDialogComponent, {
      data: dialogData,
      position: { top: '50px' }
    });
  }

}