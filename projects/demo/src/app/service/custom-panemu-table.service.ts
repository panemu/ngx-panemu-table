import { formatDate } from '@angular/common';
import { Inject, Injectable, LOCALE_ID } from '@angular/core';
import { CellFormatter, DefaultColumnOptions, LabelTranslation, PanemuTableService, TableOptions } from 'ngx-panemu-table';

@Injectable({providedIn: 'root'})
export class CustomPanemuTableService extends PanemuTableService {
  
  labelTranslation: LabelTranslation;

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

}