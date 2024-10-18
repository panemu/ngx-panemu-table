import { NgDocPage } from '@ng-doc/core';
import UsagesCategory from '../usages/ng-doc.category';
import { CellSpanComponent } from '../../example/cell-span/cell-span.component';

const CellSpanningPage: NgDocPage = {
  title: `Cell Spanning`,
  mdFile: './index.md',
  order: 50,
  category: UsagesCategory,
  demos: { CellSpanComponent }
};

export default CellSpanningPage;
