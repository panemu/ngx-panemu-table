import { NgDocPage } from '@ng-doc/core';
import { VerticalScrollComponent } from '../../example/vertical-scroll.component';
import UsagesCategory from '../usages/ng-doc.category';
import { BasicComponent } from '../../example/basic.component';

const VerticalScrollPage: NgDocPage = {
  title: `Vertical Scroll`,
  mdFile: './index.md',
  category: UsagesCategory,
  order: 100,
  demos: { BasicComponent, VerticalScrollComponent }
};

export default VerticalScrollPage;
