import { Component, OnInit, WritableSignal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CellEditorComponent } from './editing-info';

@Component({
    selector: 'date-time-cell-editor',
    imports: [ReactiveFormsModule],
    template: `<input type="datetime-local" [formControl]="formControl" class="editor-input" step="1" [title]="errorMessage() || ''">`
})

export class DateTimeCellEditor implements CellEditorComponent {
  formControl!: FormControl;
  errorMessage!: WritableSignal<string | null>
}