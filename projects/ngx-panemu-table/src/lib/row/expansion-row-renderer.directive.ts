import { ComponentRef, Directive, Input, OnDestroy, OnInit, Type, ViewContainerRef } from '@angular/core';
import { PropertyColumn } from '../column/column';
import { ExpansionRowRenderer } from './expansion-row';

@Directive({
  selector: '[expansionRowRenderer]',
  standalone: true
})
export class ExpansionRowRendererDirective implements OnInit, OnDestroy {
  @Input({alias: 'expansionRowRenderer'}) component!: Type<ExpansionRowRenderer<any>>;
  @Input() row!: any;
  @Input() column!: PropertyColumn<any>;
  @Input() close!: Function;
  componentRef?: ComponentRef<ExpansionRowRenderer<any>> | null;

  constructor(private container: ViewContainerRef) { }

  ngOnInit(): void {
    this.componentRef?.destroy();
    
    this.componentRef = this.container.createComponent(this.component);
    this.componentRef.instance.row = this.row;
    this.componentRef.instance.column = this.column;
    this.componentRef.instance.close = this.close;
  }

  ngOnDestroy(): void {
    this.componentRef?.destroy();
    this.componentRef = null;  
  }

}