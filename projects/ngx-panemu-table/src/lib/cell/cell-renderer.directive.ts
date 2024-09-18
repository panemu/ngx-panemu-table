import { Directive, Input, OnInit, ViewContainerRef } from '@angular/core';
import { PropertyColumn } from '../column/column';

@Directive({
  selector: '[cellRenderer]',
  standalone: true
})
export class CellRendererDirective implements OnInit {
  @Input({alias: 'cellRenderer'}) column!: PropertyColumn<any>;
  @Input() row: any;

  constructor(private container: ViewContainerRef) { }

  ngOnInit(): void {
    let componentRef = this.container.createComponent(this.column.cellRenderer!.component);
    componentRef.instance.column = this.column;
    componentRef.instance.row = this.row;
    componentRef.instance.parameter = this.column.cellRenderer!.parameter;
  }

}