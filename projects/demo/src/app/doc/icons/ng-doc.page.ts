import { NgDocPage } from '@ng-doc/core';
import UsagesCategory from '../usages/ng-doc.category';
import { PersistStateComponent } from '../../example/persist-state.component';
import { IconPreviewComponent } from '../../example/icon/icon-preview.component';

const IconsPage: NgDocPage = {
  title: `Icons`,
  mdFile: './index.md',
  order: 190,
  category: UsagesCategory,
  demos: { IconPreviewComponent }
};

export default IconsPage;
