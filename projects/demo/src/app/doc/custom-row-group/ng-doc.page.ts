import { NgDocPage } from '@ng-doc/core';
import UsagesCategory from '../usages/ng-doc.category';
import { CustomRowGroupComponent } from '../../example/custom-row-group/custom-row-group.component';

const CustomRowGroupPage: NgDocPage = {
  title: `Custom Row Group`,
  mdFile: './index.md',
  category: UsagesCategory,
  order: 60,
  demos: { CustomRowGroupComponent }
};

export default CustomRowGroupPage;
