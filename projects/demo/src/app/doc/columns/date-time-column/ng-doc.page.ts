import {NgDocPage} from '@ng-doc/core';
import ColumnsCategory from '../ng-doc.category';
import { DateTimeColumnComponent } from './date-time-column.component';

const DateTimeColumnPage: NgDocPage = {
	title: `DateTime Column`,
	mdFile: './index.md',
	category: ColumnsCategory,
	order: 20,
	demos: {DateTimeColumnComponent}
};

export default DateTimeColumnPage;
