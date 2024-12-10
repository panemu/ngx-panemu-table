import {NgDocPage} from '@ng-doc/core';
import ColumnsCategory from '../ng-doc.category';
import { TickableRowComponent } from '../../../example/tickable-row.component';

const TickColumnPage: NgDocPage = {
	title: `Tick Column`,
	mdFile: './index.md',
	category: ColumnsCategory,
	order: 40,
	demos: {TickableRowComponent}
};

export default TickColumnPage;
