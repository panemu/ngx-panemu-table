import { NgDocPage } from '@ng-doc/core';
import UsagesCategory from '../usages/ng-doc.category';
import { FilterExamplesComponent } from '../../example/filter-examples.component';

const FilterExamplesPage: NgDocPage = {
  title: `Filter Examples`,
  mdFile: './index.md',
  category: UsagesCategory,
  order: 120,
  demos: { FilterExamplesComponent }
};

export default FilterExamplesPage;
