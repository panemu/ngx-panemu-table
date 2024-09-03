import { Routes } from '@angular/router';
import { AllFeaturesClientComponent } from './example/all-features-client.component';
import { AllFeaturesServerComponent } from './example/all-features-server.component';
import { TickableRowComponent } from './example/tickable-row.component';
import { ComputedComponent } from './example/computed.component';
import { BasicComponent } from './example/basic.component';
import { CustomCellComponent } from './example/custom-cell/custom-cell.component';
import { ColumnTypeComponent } from './example/column-type.component';
import { DynamicRowStyleComponent } from './doc/advanced-usage/dynamic-row-style.component';
import { DynamicCellStyleComponent } from './doc/advanced-usage/dynamic-cell-style.component';
import { MultilineColumnnComponent } from './doc/columns/multiline-column/multiline-column.component';

export const routes: Routes = [
	{ path: 'basic', component: BasicComponent },
	// { path: 'guide', component: GuideComponent },
	{ path: 'column-type', component: ColumnTypeComponent },
	// { path: 'column-width', component: ColumnWidthComponent },
	{ path: 'computed', component: ComputedComponent },
	// { path: 'pagination', component: PaginationComponent },
	{ path: 'all-features-client', component: AllFeaturesClientComponent },
	{ path: 'tick', component: TickableRowComponent },
	{ path: 'all-features-server', component: AllFeaturesServerComponent },
	// { path: 'delayed', component: DelayedComponent },
	{ path: 'custom-cell', component: CustomCellComponent },
	{ path: 'row-style', component: DynamicRowStyleComponent },
	{ path: 'cell-style', component: DynamicCellStyleComponent },
	{ path: 'multiline', component: MultilineColumnnComponent },
	{ path: '', redirectTo: 'getting-started/introduction', pathMatch: 'full' }
];
