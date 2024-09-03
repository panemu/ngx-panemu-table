import { Directive, Input, OnInit, ViewContainerRef } from '@angular/core';
import { PropertyColumn } from '../column/column';

@Directive({
  selector: '[headerRenderer]',
  standalone: true
})
export class HeaderRendererDirective implements OnInit {
  @Input({alias: 'headerRenderer'}) column!: PropertyColumn<any>;

  constructor(private container: ViewContainerRef) { }

  ngOnInit(): void {
    let componentRef = this.container.createComponent(this.column.headerRenderer!.component);
    componentRef.instance.column = this.column!;
  }

}