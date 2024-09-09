import {NgDocPage} from '@ng-doc/core';
import { ColumnGroupComponent } from '../../../example/column-group.component';
import ColumnsCategory from '../ng-doc.category';

/**
 * @status:info v.0.0.5
 */
const GroupedColumnPage: NgDocPage = {
	title: `Grouped Column`,
	mdFile: './index.md',
	demos: {ColumnGroupComponent},
	category: ColumnsCategory,
	order: 80
};

export default GroupedColumnPage;
