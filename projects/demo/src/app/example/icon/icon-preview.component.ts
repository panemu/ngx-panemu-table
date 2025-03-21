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
  icons: string[] = [];

  wrapperClasses = ['', 'fontawesome', 'heroicons'];
  pts = inject(PanemuTableService);
  columns = this.pts.buildColumns([])
  controller = PanemuTableController.create(this.columns, new PanemuTableDataSource());
  constructor() { }

  ngOnInit() {
    this.readIconCssList();
  }

  private readIconCssList() {
    let sheets = document.styleSheets;
    let mainCss: CSSStyleSheet | null = null;
    for (let index = 0; index < sheets.length; index++) {
      const element = sheets[index];
      if (element.href?.endsWith('styles.css')) {
        mainCss = element;
        break;
      }
    }
    if (mainCss) {
      let rules = mainCss.cssRules;
      this.icons = []
      for (let index = 0; index < rules.length; index++) {
        const rule = rules[index];
        if (rule instanceof CSSStyleRule) {
          if (rule.selectorText.includes('.ngx-panemu-table-icon') && rule.selectorText.includes('::after')) {
            this.icons.push(rule.selectorText.replace('::after', '').replace('.ngx-panemu-table-icon.', ''));
          }
        }
      }
    }
  }
  
}