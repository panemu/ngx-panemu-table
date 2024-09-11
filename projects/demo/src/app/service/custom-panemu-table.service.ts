import { formatDate } from '@angular/common';
import { Inject, Injectable, LOCALE_ID } from '@angular/core';
import { CellFormatter, DefaultColumnOptions, LabelTranslation, PanemuTableService } from 'ngx-panemu-table';

@Injectable({providedIn: 'root'})
export class CustomPanemuTableService extends PanemuTableService {
  
  labelTranslation: LabelTranslation;

  constructor(@Inject(LOCALE_ID) locale: string) { 
    super(locale)
    
    this.labelTranslation = super.getLabelTranslation();
    this.labelTranslation.searcForValueInColumn = 'Filter "{par0}" on column:'
  }

  override getLabelTranslation()  {
    return this.labelTranslation;
  }

  override getDateCellFormatter(): CellFormatter {
    return (val) => {
      return formatDate(val, 'd MMM yyyy', this.locale) || ''
    }
  }

  override getDefaultColumnOptions(): DefaultColumnOptions {
      const options = super.getDefaultColumnOptions();
      options.sortable = false;
      return options;
  }
  
}