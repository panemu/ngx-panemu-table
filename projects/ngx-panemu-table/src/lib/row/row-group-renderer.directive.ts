import { Directive, Input, OnInit, Type, ViewContainerRef } from '@angular/core';
import { RowGroup } from './row-group';
import { DefaultRowGroupRenderer, RowGroupRenderer } from './default-row-group-renderer';

@Directive({
  selector: '[rowGroupRenderer]',
  standalone: true
})
export class RowGroupRendererDirective implements OnInit {
  @Input() rowGroupRenderer?: RowGroupRenderer;
  @Input() colSpan!: number;
  @Input() rowGroup!: RowGroup;
  @Input() expandAction!: (group: RowGroup) => void;

  constructor(private container: ViewContainerRef) { }

  ngOnInit(): void {
    let componentRef = this.container.createComponent(this.rowGroupRenderer?.component || DefaultRowGroupRenderer);
    componentRef.instance.colSpan = this.colSpan;
    componentRef.instance.rowGroup = this.rowGroup;
    componentRef.instance.expandAction = this.expandAction;
    componentRef.instance.parameter = this.rowGroupRenderer?.parameter;
  }

}