import { ComponentRef, Directive, Input, OnDestroy, OnInit, Type, ViewContainerRef } from '@angular/core';
import { RowGroupContentComponent } from './default-row-group-renderer';
import { RowGroup } from './row-group';

@Directive({
  selector: '[rowGroupContentRenderer]',
  standalone: true
})
export class RowGroupContentRendererDirective implements OnInit, OnDestroy {
  @Input() rowGroupContentRenderer!: Type<RowGroupContentComponent>;
  @Input() rowGroup!: RowGroup;
  componentRef?: ComponentRef<RowGroupContentComponent> | null;
  constructor(private container: ViewContainerRef) { }

  ngOnInit(): void {
    this.componentRef?.destroy();
    this.componentRef = this.container.createComponent(this.rowGroupContentRenderer);
    this.componentRef.instance.rowGroup = this.rowGroup;
  }

  ngOnDestroy(): void {
      this.componentRef?.destroy;
      this.componentRef = null;
  }
}