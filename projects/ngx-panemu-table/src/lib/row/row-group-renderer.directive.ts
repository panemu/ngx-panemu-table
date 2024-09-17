import { Directive, Input, OnInit, Type, ViewContainerRef } from '@angular/core';
import { RowGroup } from './row-group';
import { DefaultRowGroupRenderer, RowGroupRenderer } from './default-row-group-renderer';

@Directive({
  selector: '[rowGroupRenderer]',
  standalone: true
})
export class RowGroupRendererDirective implements OnInit {
  @Input() rowGroupRenderer?: RowGroupRenderer;
  @Input({required: true}) colSpan!: number;
  @Input({required: true}) rowGroup!: RowGroup;
  @Input({required: true}) expandAction!: (group: RowGroup) => void;
  @Input() parameter?: any;

  constructor(private container: ViewContainerRef) { }

  ngOnInit(): void {
    let componentRef = this.container.createComponent(this.rowGroupRenderer?.component || DefaultRowGroupRenderer);
    componentRef.setInput('colSpan', this.colSpan);
    componentRef.setInput('rowGroup', this.rowGroup);
    componentRef.setInput('expandAction', this.expandAction);
    componentRef.setInput('parameter', this.rowGroupRenderer?.parameter)
  }

}