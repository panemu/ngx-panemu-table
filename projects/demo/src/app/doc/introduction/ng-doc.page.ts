import {NgDocPage} from '@ng-doc/core';
import GettingStartedCategory from '../getting-started/ng-doc.category';
import { AllFeaturesClientComponent } from '../../example/all-features-client.component';

const IntroductionPage: NgDocPage = {
  title: `Introduction`,
  mdFile: './index.md',
  category: GettingStartedCategory,
  order: 5,
  demos: {AllFeaturesClientComponent}
};

export default IntroductionPage;
