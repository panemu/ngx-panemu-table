import { ComponentRef, Directive, Input, OnChanges, OnDestroy, SimpleChanges, ViewContainerRef } from '@angular/core';
import { LeafColumn } from '../column/column';
import { CellComponent } from './cell';

@Directive({
  selector: '[cellRenderer]',
  standalone: true
})
export class CellRendererDirective implements OnChanges, OnDestroy {
  @Input({alias: 'cellRenderer'}) column!: LeafColumn<any>;
  @Input() row: any;
  componentRef?: ComponentRef<CellComponent<any>> | null;
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