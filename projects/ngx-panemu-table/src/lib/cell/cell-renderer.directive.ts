import { ComponentRef, Directive, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewContainerRef } from '@angular/core';
import { PropertyColumn } from '../column/column';

@Directive({
  selector: '[cellRenderer]',
  standalone: true
})
export class CellRendererDirective implements OnChanges, OnDestroy {
  @Input({alias: 'cellRenderer'}) column!: PropertyColumn<any>;
  @Input() row: any;
  componentRef?: ComponentRef<any> | null;
  constructor(private container: ViewContainerRef) { }
  
  ngOnChanges(changes: SimpleChanges): void {
    this.recreateElement();
  }

  ngOnDestroy(): void {
    this.componentRef?.destroy();
    this.componentRef = null;
  }

  recreateElement(): void {
    if (this.componentRef) {
      this.componentRef.destroy();
    }
    
    this.componentRef = this.container.createComponent(this.column.cellRenderer!.component);
    this.componentRef.instance.column = this.column;
    this.componentRef.instance.row = this.row;
    this.componentRef.instance.parameter = this.column.cellRenderer!.parameter;
  }



}