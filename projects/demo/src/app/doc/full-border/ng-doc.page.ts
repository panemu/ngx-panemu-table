import { NgDocPage } from '@ng-doc/core';
import UsagesCategory from '../usages/ng-doc.category';
import { FullBorderComponent } from '../../example/full-border.component';

const FullBorderPage: NgDocPage = {
  title: `Full Border`,
  mdFile: './index.md',
  category: UsagesCategory,
  order: 130,
  demos: { FullBorderComponent }
};

export default FullBorderPage;
