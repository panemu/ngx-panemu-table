import {NgDocPage} from '@ng-doc/core';
import { ColumnGroupComponent } from '../../../example/column-group.component';
import ColumnsCategory from '../ng-doc.category';

const GroupedColumnPage: NgDocPage = {
	title: `Grouped Column`,
	mdFile: './index.md',
	demos: {ColumnGroupComponent},
	category: ColumnsCategory,
	order: 80
};

export default GroupedColumnPage;
