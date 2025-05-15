import { ComponentRef, Directive, Input, OnChanges, OnDestroy, OnInit, Optional, SimpleChanges, ViewContainerRef } from '@angular/core';
import { PropertyColumn } from '../column/column';
import { CellEditorRenderer } from './editing-info';

@Directive({
  selector: '[cellEditorRenderer]',
  standalone: true
})
export class CellEditorRendererDirective implements OnChanges, OnDestroy {
  @Input({ alias: 'cellEditorRenderer' }) column!: PropertyColumn<any>;
  @Input() row: any;
  @Input({ required: false }) editor?: CellEditorRenderer<any>;

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
    this.componentRef?.destroy();

    if (this.editor?.formControl) {
      let cellEditorComponent = this.container.createComponent(this.editor.component);
      cellEditorComponent.instance.formControl = this.editor.formControl;
      cellEditorComponent.instance.parameter = this.editor.parameter;
      cellEditorComponent.instance.errorMessage = this.editor.errorMessage;
      
      this.componentRef = cellEditorComponent;
    } else {
      let valueDisplay = this.container.createComponent(this.column.cellRenderer!.component);
      valueDisplay.instance.column = this.column;
      valueDisplay.instance.row = this.row;
      valueDisplay.instance.parameter = this.column.cellRenderer!.parameter;

      this.componentRef = valueDisplay;
    }
  }
}