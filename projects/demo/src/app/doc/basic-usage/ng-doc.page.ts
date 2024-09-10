import {NgDocPage} from '@ng-doc/core';
import GettingStartedCategory from '../getting-started/ng-doc.category';
import { BasicComponent } from '../../example/basic.component';
import { PaginationComponent } from '../../example/pagination.component';
import { AllFeaturesClientComponent } from '../../example/all-features-client.component';
import UsagesCategory from '../usages/ng-doc.category';

const BasicUsagePage: NgDocPage = {
	title: `Basic Usage`,
	mdFile: './index.md',
	category: UsagesCategory,
	order: 10,
	demos: {BasicComponent, PaginationComponent, AllFeaturesClientComponent}
};

export default BasicUsagePage;
