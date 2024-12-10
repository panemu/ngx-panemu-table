import {NgDocPage} from '@ng-doc/core';
import ColumnsCategory from '../ng-doc.category';
import { MultilineColumnnComponent } from './multiline-column.component';

const MultilineColumnPage: NgDocPage = {
	title: `Multiline Column`,
	mdFile: './index.md',
	category: ColumnsCategory,
	order: 70,
	demos: {MultilineColumnnComponent}
};

export default MultilineColumnPage;
