import {NgDocPage} from '@ng-doc/core';
import UsagesCategory from '../usages/ng-doc.category';
import { ErrorHandlingSample } from '../../example/error-handling/error-handling-sample.component';

const ErrorHandlingPage: NgDocPage = {
	title: `Error Handling`,
	mdFile: './index.md',
  category: UsagesCategory,
  order: 75,
  demos: { ErrorHandlingSample }
};

export default ErrorHandlingPage;
