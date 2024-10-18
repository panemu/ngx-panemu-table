import { ComponentRef, Directive, Input, OnChanges, OnInit, SimpleChanges, ViewContainerRef } from '@angular/core';
import { DefaultRowGroupRenderer, RowGroupComponent, RowGroupRenderer } from './default-row-group-renderer';
import { RowGroup } from './row-group';

@Directive({
  selector: '[rowGroupRenderer]',
  standalone: true
})
export class RowGroupRendererDirective implements OnChanges {
  @Input() rowGroupRenderer?: RowGroupRenderer;
  @Input() colSpan!: number;
  @Input() rowGroup!: RowGroup;
  @Input() expandAction!: (group: RowGroup, usePagination?: boolean) => void;
  componentRef?: ComponentRef<RowGroupComponent> | null;
  constructor(private container: ViewContainerRef) { }

  ngOnInit() {
    
  }

  ngOnChanges(changes: SimpleChanges): void {
    // if (changes['rowGroupRenderer']) {
      this.recreateElement();
    // }
  }
  recreateElement(): void {
    this.componentRef?.destroy();
    
    this.componentRef = this.container.createComponent(this.rowGroupRenderer?.component || DefaultRowGroupRenderer);
    this.componentRef.instance.colSpan = this.colSpan;
    this.componentRef.instance.rowGroup = this.rowGroup;
    this.componentRef.instance.expandAction = this.expandAction;
    this.componentRef.instance.parameter = this.rowGroupRenderer?.parameter;
  }
  ngOnDestroy(): void {
    this.componentRef?.destroy();
    this.componentRef = null;
  }

}