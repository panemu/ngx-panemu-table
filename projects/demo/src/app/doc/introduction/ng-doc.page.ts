import { NgDocPage } from '@ng-doc/core';
import { AllFeaturesClientComponent } from '../../example/all-features-client.component';
import { BasicComponent } from '../../example/basic.component';
import GettingStartedCategory from '../getting-started/ng-doc.category';

const IntroductionPage: NgDocPage = {
  title: `Introduction`,
  mdFile: './index.md',
  category: GettingStartedCategory,
  order: 5,
  demos: {AllFeaturesClientComponent, BasicComponent}
};

export default IntroductionPage;
