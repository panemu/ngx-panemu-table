import { NgDocPage } from '@ng-doc/core';
import ColumnsCategory from '../ng-doc.category';
import { MapColumnComponent } from './map-column.component';

const MapColumnPage: NgDocPage = {
  title: `Map Column`,
  mdFile: './index.md',
  category: ColumnsCategory,
  order: 30,
  demos: { MapColumnComponent }
};

export default MapColumnPage;
