import { ComponentRef, Directive, EmbeddedViewRef, Input, isSignal, OnChanges, OnDestroy, OnInit, SimpleChanges, TemplateRef, Type, ViewContainerRef } from '@angular/core';
import { RowGroupFooterComponent, RowGroupRenderer } from './default-row-group-renderer';
import { RowGroup } from './row-group';

@Directive({
  selector: '[rowGroupFooterRenderer]',
  standalone: true
})
export class RowGroupFooterRendererDirective implements OnChanges, OnInit, OnDestroy {
  @Input() rowGroupFooterRenderer!: RowGroupRenderer;
  @Input() colSpan!: number;
  @Input() rowGroup!: RowGroup;
  componentRef!: ComponentRef<RowGroupFooterComponent> | null;
  embeddedViewRef!: EmbeddedViewRef<any> | null;
  
  constructor(private container: ViewContainerRef) { 
  }

  ngOnDestroy(): void {
    this.componentRef?.destroy();
    this.embeddedViewRef?.destroy();
    this.componentRef = null;
    this.embeddedViewRef = null;
  }
  ngOnInit(): void {
    this.recreateElement();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // console.log('changes')
    // this.recreateElement();
  }

  recreateElement(): void {
    this.embeddedViewRef?.destroy();
    this.componentRef?.destroy();
    
    if (isSignal(this.rowGroupFooterRenderer.footerComponent)) {
      this.embeddedViewRef = this.container.createEmbeddedView(this.rowGroupFooterRenderer.footerComponent() as TemplateRef<any>, {rowGroup: this.rowGroup, colSpan: this.colSpan, parameter: this.rowGroupFooterRenderer.parameter});
    } else {
      this.componentRef = this.container.createComponent(this.rowGroupFooterRenderer.footerComponent as Type<RowGroupFooterComponent>);
      this.componentRef.instance.colSpan = this.colSpan;
      this.componentRef.instance.rowGroup = this.rowGroup;
      this.componentRef.instance.parameter = this.rowGroupFooterRenderer.parameter;
    }
  }

}