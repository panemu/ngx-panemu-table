import { Component, inject, OnInit, ViewEncapsulation } from '@angular/core';
import { PanemuTableController, PanemuTableDataSource, PanemuTableService } from 'ngx-panemu-table';

@Component({
  selector: 'icon-preview',
  standalone: true,
  template: `
<div class="grid grid-cols-4 gap-4">
  <div class="text-sm font-bold">CSS Class Name</div>
	<div class="text-sm font-bold">Default (Material Symbols)</div>
	<div class="text-sm font-bold underline"><a href="https://fontawesome.com/" target="_blank">FontAwesome</a></div>
	<div class="text-sm font-bold underline"><a href="https://heroicons.com/" target="_blank">Hero Icon (svg)</a></div>
  @for (iconName of icons; track $index) {
    <div class="text-sm">{{iconName}}</div>
    @for (wrapperClass of wrapperClasses; track $index) {
      <div class="{{wrapperClass}}">
        <span class="ngx-panemu-table-icon {{iconName}}"></span>
      </div>
    }
  }
</div>
	`,
  styleUrl: 'icon-preview.component.scss',
  encapsulation: ViewEncapsulation.None
})

export class IconPreviewComponent implements OnInit {
  icons: string[] = [
    'icon-settings',
    'icon-arrow_drop_down',
    'icon-arrow_drop_up',
    'icon-splitscreen_top',
    'icon-close',
    'icon-search',
    'icon-check',
    'icon-arrow_right',
    'icon-expand_more',
    'icon-chevron_right',
    'icon-west',
    'icon-east',
    'icon-align_horizontal_left',
    'icon-align_horizontal_right',
    'icon-horizontal_distribute'
  ];

  wrapperClasses = ['', 'fontawesome', 'heroicons'];
  pts = inject(PanemuTableService);
  columns = this.pts.buildColumns([])
  controller = PanemuTableController.create(this.columns, new PanemuTableDataSource());
  constructor() { }

  ngOnInit() { }
}