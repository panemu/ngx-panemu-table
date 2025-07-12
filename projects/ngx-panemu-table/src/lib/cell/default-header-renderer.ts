import { Component, Input, OnInit, Signal, TemplateRef } from '@angular/core';
import { PropertyColumn } from '../column/column';
import { HeaderComponent, HeaderRenderer } from './header';
import { CommonModule } from '@angular/common';

@Component({
    template: `
  <ng-container
  *ngTemplateOutlet="templateRef?.() || defaultDescriptionTemplate; context:{column}">
  </ng-container>
  <ng-template #defaultDescriptionTemplate >
      {{column.label}}
  </ng-template>
  `,
    imports: [CommonModule]
})
export class DefaultHeaderRenderer implements OnInit, HeaderComponent {
  column!: PropertyColumn<any>
  parameter: any;
  templateRef?: Signal<TemplateRef<any>>;

  ngOnInit(): void {
    this.templateRef = this.parameter?.templateRef
  }

  static create(templateRef?: Signal<TemplateRef<any> | undefined>): HeaderRenderer {
    return {
      component: DefaultHeaderRenderer,
      parameter: {templateRef}
    }
  }
}