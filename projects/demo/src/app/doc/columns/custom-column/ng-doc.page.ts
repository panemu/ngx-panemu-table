import { NgDocPage } from '@ng-doc/core';
import ColumnsCategory from '../ng-doc.category';
import { CustomCellComponent } from '../../../example/custom-cell/custom-cell.component';

const CustomColumnPage: NgDocPage = {
  title: `Custom Column`,
  mdFile: './index.md',
  category: ColumnsCategory,
  order: 60,
  demos: { CustomCellComponent }
};

export default CustomColumnPage;
