import { NgDocPage } from '@ng-doc/core';
import UsagesCategory from '../usages/ng-doc.category';
import { VirtualScrollComponent } from '../../example/virtual-scroll.component';

const VirtualScrollPage: NgDocPage = {
  title: `Virtual Scroll`,
  mdFile: './index.md',
  category: UsagesCategory,
  order: 90,
  demos: { VirtualScrollComponent }
};

export default VirtualScrollPage;
