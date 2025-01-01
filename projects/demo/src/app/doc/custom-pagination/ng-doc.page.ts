import { NgDocPage } from '@ng-doc/core';
import UsagesCategory from '../usages/ng-doc.category';
import { CustomPaginationShowcaseComponent } from '../../example/custom-component/custom-pagination-showcase.component';

const CustomPaginationPage: NgDocPage = {
  title: `Custom Pagination`,
  mdFile: './index.md',
  category: UsagesCategory,
  demos: {CustomPaginationShowcaseComponent},
  order: 180
};

export default CustomPaginationPage;
