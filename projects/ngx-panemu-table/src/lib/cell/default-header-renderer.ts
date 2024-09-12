import { Component, OnInit, Signal, TemplateRef } from '@angular/core';
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
  imports: [CommonModule],
  standalone: true
})
export class DefaultHeaderRenderer implements OnInit, HeaderComponent<any> {
  column!: PropertyColumn<any>
  templateRef?: Signal<TemplateRef<any>>;
  parameter: any;

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