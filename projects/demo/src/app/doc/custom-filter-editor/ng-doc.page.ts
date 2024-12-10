import { NgDocPage } from '@ng-doc/core';
import UsagesCategory from '../usages/ng-doc.category';
import { CustomFilterEditorComponent } from '../../example/custom-filter-editor.component';

const CustomFilterEditorPage: NgDocPage = {
  title: `Custom Filter Editor`,
  mdFile: './index.md',
  category: UsagesCategory,
  order: 80,
  demos: { CustomFilterEditorComponent }
};

export default CustomFilterEditorPage;
