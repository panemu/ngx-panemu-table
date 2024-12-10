import { NgDocPage } from '@ng-doc/core';
import { AllFeaturesServerComponent } from '../../example/all-features-server.component';
import UsagesCategory from '../usages/ng-doc.category';

const AdvancedUsagePage: NgDocPage = {
	title: `Advanced Usage`,
	mdFile: './index.md',
	category: UsagesCategory,
	order: 20,
	demos: {AllFeaturesServerComponent}
};

export default AdvancedUsagePage;
