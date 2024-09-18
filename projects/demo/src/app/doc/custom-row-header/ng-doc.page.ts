import {NgDocPage} from '@ng-doc/core';
import UsagesCategory from '../usages/ng-doc.category';
import { CustomHeaderComponent } from '../../example/custom-header.component';

const CustomRowHeaderPage: NgDocPage = {
	title: `Custom Row Header`,
	mdFile: './index.md',
	category: UsagesCategory,
	order: 50,
	demos: {CustomHeaderComponent}
};

export default CustomRowHeaderPage;
