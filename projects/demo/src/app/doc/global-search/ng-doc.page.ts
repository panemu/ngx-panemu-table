import {NgDocPage} from '@ng-doc/core';
import UsagesCategory from '../usages/ng-doc.category';
import { GlobalSearchComponent } from '../../example/custom-component/global-search.component';
import { ColumnSearchComponent } from '../../example/custom-component/column-search.component';

const GlobalSearchPage: NgDocPage = {
	title: `Global Search`,
	mdFile: './index.md',
	category: UsagesCategory,
	demos: {GlobalSearchComponent, ColumnSearchComponent},
	order: 170
};

export default GlobalSearchPage;
