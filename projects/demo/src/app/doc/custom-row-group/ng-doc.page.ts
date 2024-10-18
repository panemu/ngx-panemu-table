import { NgDocPage } from '@ng-doc/core';
import UsagesCategory from '../usages/ng-doc.category';
import { CustomRowGroupComponent } from '../../example/custom-row-group/custom-row-group.component';
import { CustomRowGroup2Component } from '../../example/custom-row-group/custom-row-group2.component';

const CustomRowGroupPage: NgDocPage = {
  title: `Custom Row Group`,
  mdFile: './index.md',
  category: UsagesCategory,
  order: 70,
  demos: { CustomRowGroupComponent, CustomRowGroup2Component }
};

export default CustomRowGroupPage;
