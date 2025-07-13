
import { Component, Input, OnInit, signal, Signal, TemplateRef } from '@angular/core';
import { CellComponent, CellFormatterPipe, CellRenderer, PropertyColumn } from 'ngx-panemu-table';
import { HighlightPipe } from './highlight.pipe';

@Component({
    imports: [HighlightPipe],
    templateUrl: 'highlight-cell-renderer.html'
})
export class HighlightCellRenderer implements CellComponent<any>, OnInit {
  row!: any;
  column!: PropertyColumn<any>
  parameter?: any;
  searchTerm!: Signal<string>;
  
  ngOnInit(): void {
    this.searchTerm = this.parameter?.searchTerm ?? signal('');
  }
  
  static create(searchTerm: Signal<string>): CellRenderer {
    return {
      component: HighlightCellRenderer,
      parameter: {searchTerm}
    }
  }

}