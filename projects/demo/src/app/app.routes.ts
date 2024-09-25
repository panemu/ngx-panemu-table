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
import { DelayedComponent } from './example/delayed.component';
import { ColumnGroupComponent } from './example/column-group.component';
import { RowDetailComponent } from './example/row-detail.component';
import { CustomHeaderComponent } from './example/custom-header.component';
import { CustomFilterEditorComponent } from './example/custom-filter-editor.component';
import { CustomRowGroupComponent } from './example/custom-row-group/custom-row-group.component';
import { DateColumnComponent } from './doc/columns/date-column/date-column.component';
import { VerticalScrollComponent } from './example/vertical-scroll.component';
import { VirtualScrollComponent } from './example/virtual-scroll.component';
import { CustomRowGroup2Component } from './example/custom-row-group/custom-row-group2.component';
import { FilterExamplesComponent } from './example/filter-examples.component';
import { MapColumnComponent } from './doc/columns/map-column/map-column.component';
import { CellSpanComponent } from './example/cell-span/cell-span.component';
import { PaginationComponent } from './example/pagination.component';

export const routes: Routes = [
	{ path: 'basic', component: BasicComponent },
	// { path: 'guide', component: GuideComponent },
	{ path: 'column-type', component: ColumnTypeComponent },
	// { path: 'column-width', component: ColumnWidthComponent },
	{ path: 'computed', component: ComputedComponent },
	{ path: 'date-column', component: DateColumnComponent },
	{ path: 'all-features-client', component: AllFeaturesClientComponent },
	{ path: 'tick', component: TickableRowComponent },
	{ path: 'all-features-server', component: AllFeaturesServerComponent },
	{ path: 'delayed', component: DelayedComponent },
	{ path: 'custom-cell', component: CustomCellComponent },
	{ path: 'row-style', component: DynamicRowStyleComponent },
	{ path: 'cell-style', component: DynamicCellStyleComponent },
	{ path: 'multiline', component: MultilineColumnnComponent },
	{ path: 'grouped-column', component: ColumnGroupComponent },
	{ path: 'row-detail', component: RowDetailComponent },
	{ path: 'custom-header', component: CustomHeaderComponent },
	{ path: 'custom-filter-editor', component: CustomFilterEditorComponent },
	{ path: 'custom-row-group', component: CustomRowGroupComponent },
	{ path: 'custom-row-group2', component: CustomRowGroup2Component },
	{ path: 'vertical-scroll', component: VerticalScrollComponent },
	{ path: 'virtual-scroll', component: VirtualScrollComponent },
	{ path: 'filter-examples', component: FilterExamplesComponent },
	{ path: 'map-column', component: MapColumnComponent },
	{ path: 'cell-span', component: CellSpanComponent },
	{ path: 'pagination', component: PaginationComponent },
	{ path: '', redirectTo: 'getting-started/introduction', pathMatch: 'full' }
];
