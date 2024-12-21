import { ChangeDetectorRef, Component, inject, OnInit, WritableSignal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CellEditorComponent } from './editing-info';

@Component({
  selector: 'number-cell-editor',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `<input type="number" [formControl]="formControl" [value]="formControl.value" class="editor-input" [title]="errorMessage() || ''">`
})

export class NumberCellEditor implements CellEditorComponent {
  
  parameter?: any;
  formControl!: FormControl;
  errorMessage!: WritableSignal<string | null>

  
}