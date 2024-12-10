import { NgDocPage } from '@ng-doc/core';
import UsagesCategory from '../usages/ng-doc.category';
import { InlineEditing1Component } from '../../example/inline-editing/inline-editing1.component';

const LocalisationPage: NgDocPage = {
  title: `Localisation`,
  mdFile: './index.md',
  category: UsagesCategory,
  demos: {InlineEditing1Component},
  order: 150
};

export default LocalisationPage;
