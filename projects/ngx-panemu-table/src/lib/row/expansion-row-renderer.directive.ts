import { Directive, Input, OnInit, Type, ViewContainerRef } from '@angular/core';
import { PropertyColumn } from '../column/column';
import { ExpansionRowRenderer } from './expansion-row';

@Directive({
  selector: '[expansionRowRenderer]',
  standalone: true
})
export class ExpansionRowRendererDirective implements OnInit {
  @Input({alias: 'expansionRowRenderer'}) component!: Type<ExpansionRowRenderer<any>>;
  @Input() row!: any;
  @Input() column!: PropertyColumn<any>;
  @Input() close!: Function;

  constructor(private container: ViewContainerRef) { }

  ngOnInit(): void {
    let componentRef = this.container.createComponent(this.component);
    componentRef.instance.row = this.row;
    componentRef.instance.column = this.column;
    componentRef.instance.close = this.close;
  }

}