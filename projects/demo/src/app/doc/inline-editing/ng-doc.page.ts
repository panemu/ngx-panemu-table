import { NgDocPage } from '@ng-doc/core';
import UsagesCategory from '../usages/ng-doc.category';
import { InlineEditing1Component } from '../../example/inline-editing/inline-editing1.component';
import { InlineEditing2Component } from '../../example/inline-editing/inline-editing2.component';
import { InlineEditing3Component } from '../../example/inline-editing/inline-editing3.component';
import { InlineEditing4Component } from '../../example/inline-editing/inline-editing4.component';
import { InlineEditing5Component } from '../../example/inline-editing/inline-editing5.component';
import { InlineEditing6Component } from '../../example/inline-editing/inline-editing6.component';
import { InlineEditing7Component } from '../../example/inline-editing/inline-editing7.component';

const InlineEditingPage: NgDocPage = {
  title: `Inline Editing`,
  mdFile: './index.md',
  category: UsagesCategory,
  demos: { 
    InlineEditing1Component,
    InlineEditing2Component,
    InlineEditing3Component,
    InlineEditing4Component,
    InlineEditing5Component,
    InlineEditing6Component,
    InlineEditing7Component,
  },
  order: 160
};

export default InlineEditingPage;
