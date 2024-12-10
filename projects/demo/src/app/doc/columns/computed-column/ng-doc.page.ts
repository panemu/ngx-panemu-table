import { NgDocPage } from '@ng-doc/core';
import ColumnsCategory from '../ng-doc.category';
import { ComputedComponent } from '../../../example/computed.component';

const ComputedColumnPage: NgDocPage = {
  title: `Computed Column`,
  mdFile: './index.md',
  category: ColumnsCategory,
  order: 50,
  demos: { ComputedComponent }
};

export default ComputedColumnPage;
