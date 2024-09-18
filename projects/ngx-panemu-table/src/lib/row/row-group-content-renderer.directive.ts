import { Directive, Input, OnInit, Type, ViewContainerRef } from '@angular/core';
import { RowGroupContentComponent } from './default-row-group-renderer';
import { RowGroup } from './row-group';

@Directive({
  selector: '[rowGroupContentRenderer]',
  standalone: true
})
export class RowGroupContentRendererDirective implements OnInit {
  @Input() rowGroupContentRenderer!: Type<RowGroupContentComponent>;
  @Input() rowGroup!: RowGroup;

  constructor(private container: ViewContainerRef) { }

  ngOnInit(): void {
    let componentRef = this.container.createComponent(this.rowGroupContentRenderer);
    componentRef.instance.rowGroup = this.rowGroup;
  }

}