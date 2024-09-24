import { NgDocPage } from '@ng-doc/core';
import UsagesCategory from '../usages/ng-doc.category';
import { DynamicCellStyleComponent } from '../advanced-usage/dynamic-cell-style.component';
import { DynamicRowStyleComponent } from '../advanced-usage/dynamic-row-style.component';

const DynamicStylingPage: NgDocPage = {
  title: `Dynamic Styling`,
  mdFile: './index.md',
  category: UsagesCategory,
  order: 110,
  demos: { DynamicRowStyleComponent, DynamicCellStyleComponent }
};

export default DynamicStylingPage;
