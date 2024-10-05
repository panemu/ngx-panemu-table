import { NgDocPage } from '@ng-doc/core';
import UsagesCategory from '../usages/ng-doc.category';
import { PersistStateComponent } from '../../example/persist-state.component';

const PersistStatesPage: NgDocPage = {
  title: `Persist States`,
  mdFile: './index.md',
  order: 140,
  category: UsagesCategory,
  demos: { PersistStateComponent }
};

export default PersistStatesPage;
