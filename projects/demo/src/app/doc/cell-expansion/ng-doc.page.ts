import {NgDocPage} from '@ng-doc/core';
import UsagesCategory from '../usages/ng-doc.category';
import { RowDetailComponent } from '../../example/row-detail.component';

const CellExpansionPage: NgDocPage = {
	title: `Cell Expansion`,
	mdFile: './index.md',
	category: UsagesCategory,
	order: 30,
	demos: {RowDetailComponent}
};

export default CellExpansionPage;
