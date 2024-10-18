import { NgDocPage } from '@ng-doc/core';
import UsagesCategory from '../usages/ng-doc.category';
import { CustomHeaderComponent } from '../../example/custom-header.component';

const CustomColumnHeaderPage: NgDocPage = {
  title: `Custom Column Header`,
  mdFile: './index.md',
  category: UsagesCategory,
  order: 60,
  demos: { CustomHeaderComponent }
};

export default CustomColumnHeaderPage;
