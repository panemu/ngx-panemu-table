import { ComponentRef, Directive, EmbeddedViewRef, inject, Input, isSignal, OnChanges, OnDestroy, Signal, SimpleChanges, TemplateRef, Type, ViewContainerRef } from "@angular/core";
import { TableFooterComponent } from "./table-footer";

@Directive({
  selector: '[tableFooterRenderer]',
  standalone: true
})
export class TableFooterRendererDirective implements OnChanges, OnDestroy {
  @Input({ alias: 'tableFooterRenderer' }) component!: Type<TableFooterComponent> | Signal<TemplateRef<any> | undefined>;
  @Input() colSpan!: number;
  @Input() parameter?: any;
  container = inject(ViewContainerRef);
  componentRef!: ComponentRef<any> | null;
  embeddedViewRef!: EmbeddedViewRef<any> | null;

  ngOnChanges(changes: SimpleChanges): void {
    this.recreateElement();
  }

  ngOnDestroy() {
    this.componentRef?.destroy();
    this.embeddedViewRef?.destroy();
    this.componentRef = null;
    this.embeddedViewRef = null;
  }

  recreateElement(): void {
    if (this.embeddedViewRef) {
      this.embeddedViewRef.destroy();
    }
    if (this.componentRef) {
      this.componentRef.destroy();
    }
    if (isSignal(this.component)) {
      this.embeddedViewRef = this.container.createEmbeddedView(this.component() as TemplateRef<any>, { parameter: this.parameter, colSpan: this.colSpan });
    } else {
      this.componentRef = this.container.createComponent(this.component as Type<TableFooterComponent>);
      this.componentRef.instance.parameter = this.parameter;
      this.componentRef.instance.colSpan = this.colSpan;
    }
  }

}