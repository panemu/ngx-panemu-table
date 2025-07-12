import { Component, WritableSignal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CellEditorComponent } from './editing-info';

@Component({
    selector: 'string-cell-editor',
    imports: [ReactiveFormsModule],
    template: `<input [formControl]="formControl" [value]="formControl.value" class="editor-input" [title]="errorMessage() || ''">`
})

export class StringCellEditor implements CellEditorComponent {
  
  formControl!: FormControl;
  errorMessage!: WritableSignal<string>;
 
}