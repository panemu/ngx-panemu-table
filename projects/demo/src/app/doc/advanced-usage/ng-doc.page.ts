import {NgDocPage} from '@ng-doc/core';
import GettingStartedCategory from '../getting-started/ng-doc.category';
import { AllFeaturesServerComponent } from '../../example/all-features-server.component';
import { DynamicRowStyleComponent } from './dynamic-row-style.component';
import { DynamicCellStyleComponent } from './dynamic-cell-style.component';

const AdvancedUsagePage: NgDocPage = {
	title: `Advanced Usage`,
	mdFile: './index.md',
	category: GettingStartedCategory,
	order: 30,
	demos: {AllFeaturesServerComponent, DynamicRowStyleComponent, DynamicCellStyleComponent}
};

export default AdvancedUsagePage;
