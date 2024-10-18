import { NgDocPage } from '@ng-doc/core';
import UsagesCategory from '../usages/ng-doc.category';
import { CustomCellRendererComponent } from '../../example/custom-cell-renderer.component';

const CellRendererPage: NgDocPage = {
	title: `Cell Renderer`,
	mdFile: './index.md',
	category: UsagesCategory,
	demos: { CustomCellRendererComponent },
	order: 40
};

export default CellRendererPage;
