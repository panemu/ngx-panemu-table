import { Component, OnInit, WritableSignal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CellEditorComponent } from './editing-info';

@Component({
  selector: 'string-cell-editor',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `<input [formControl]="formControl"  class="editor-input" [title]="errorMessage() || ''">`
})

export class StringCellEditor implements CellEditorComponent {
  
  formControl!: FormControl;
  errorMessage!: WritableSignal<string>;
  
}