import { ComponentRef, Directive, Input, OnChanges, OnInit, SimpleChanges, Type, ViewContainerRef, WritableSignal } from '@angular/core';
import { BaseColumn } from '../../column/column';
import { TableCriteria } from '../../table-query';
import { FilterEditor } from './filter-editor';

@Directive({
  selector: '[filterEditor]',
  standalone: true
})
export class FilterEditorDirective implements OnChanges {
  @Input({alias: 'filterEditor'}) component!: Type<FilterEditor>;
  @Input() column!: BaseColumn<any>
  @Input() filter!: TableCriteria
  @Input() value!: WritableSignal<string | undefined | null>
  componentRef?: ComponentRef<any>
  constructor(private container: ViewContainerRef) { }
  
  ngOnChanges(changes: SimpleChanges): void {
    this.createComponent();
  }

  createComponent(): void {
    this.componentRef?.destroy();
    this.componentRef = this.container.createComponent(this.component);
    this.componentRef.instance.column = this.column;
    this.componentRef.instance.filter = this.filter;
    this.componentRef.instance.value = this.value;
  }

  

}