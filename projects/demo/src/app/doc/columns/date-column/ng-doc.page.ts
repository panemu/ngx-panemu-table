import {NgDocPage} from '@ng-doc/core';
import { DateColumnComponent } from './date-column.component';
import ColumnsCategory from '../ng-doc.category';

const DateColumnPage: NgDocPage = {
  title: `Date Column`,
  mdFile: './index.md',
  demos: {DateColumnComponent},
  category: ColumnsCategory,
  order: 10
};

export default DateColumnPage;
