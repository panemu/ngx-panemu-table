import { formatDate } from '@angular/common';
import { Inject, Injectable, LOCALE_ID } from '@angular/core';
import { CellFormatter, DefaultColumnOptions, LabelTranslation, PanemuTableService, TableOptions } from 'ngx-panemu-table';
import { CountryRowGroupFooter } from '../example/custom-row-group/country-row-group-footer.component';

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

  override getColumnOptions(): Required<DefaultColumnOptions> {
      const options = super.getColumnOptions();
      options.sortable = false;
      return options;
  }

  // override getTableOptions<T>(): TableOptions<T> {
  //     const result = super.getTableOptions<T>();
  //     result.footer = {component: CountryRowGroupFooter}
  //     return result;
  // }

}